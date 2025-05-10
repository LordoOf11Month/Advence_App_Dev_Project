package com.example.services;

import com.example.models.PaymentMethod;
import com.example.models.User;
import com.example.repositories.PaymentMethodRepository;
import com.example.repositories.UserRepository;
import com.stripe.exception.StripeException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodService {
    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepository,
                              UserRepository userRepository,
                              StripeService stripeService) {
        this.paymentMethodRepository = paymentMethodRepository;
        this.userRepository = userRepository;
        this.stripeService = stripeService;
    }

    @Transactional
    public PaymentMethod addPaymentMethod(Integer userId, String stripePaymentMethodId) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Attach payment method to Stripe customer
        com.stripe.model.PaymentMethod stripePaymentMethod = stripeService.attachPaymentMethod(
            user.getStripeCustomerId(),
            stripePaymentMethodId
        );

        // Create payment method entity
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUser(user);
        paymentMethod.setStripePaymentMethodId(stripePaymentMethodId);
        paymentMethod.setBrand(convertCardBrand(stripePaymentMethod.getCard().getBrand()));
        paymentMethod.setLast4Digits(stripePaymentMethod.getCard().getLast4());
        paymentMethod.setExpMonth(stripePaymentMethod.getCard().getExpMonth().intValue());
        paymentMethod.setExpYear(stripePaymentMethod.getCard().getExpYear().intValue());

        // If this is the first payment method, set it as default
        if (paymentMethodRepository.countByUser(user) == 0) {
            paymentMethod.setIsDefault(true);
            stripeService.setDefaultPaymentMethod(user.getStripeCustomerId(), stripePaymentMethodId);
        }

        return paymentMethodRepository.save(paymentMethod);
    }

    @Transactional
    public void setDefaultPaymentMethod(Integer userId, Long paymentMethodId) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        if (paymentMethod.getUser().getId() != userId) {
            throw new RuntimeException("Payment method does not belong to user");
        }

        // Update all payment methods to not be default
        paymentMethodRepository.findByUser(user).forEach(pm -> {
            pm.setIsDefault(false);
            paymentMethodRepository.save(pm);
        });

        // Set the selected payment method as default
        paymentMethod.setIsDefault(true);
        paymentMethodRepository.save(paymentMethod);

        // Update default payment method in Stripe
        stripeService.setDefaultPaymentMethod(user.getStripeCustomerId(), paymentMethod.getStripePaymentMethodId());
    }

    @Transactional
    public void removePaymentMethod(Integer userId, Long paymentMethodId) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        if (paymentMethod.getUser().getId() != userId) {
            throw new RuntimeException("Payment method does not belong to user");
        }

        // If this is the default payment method, we need to set a new default
        if (paymentMethod.getIsDefault()) {
            List<PaymentMethod> otherMethods = paymentMethodRepository.findByUserAndIdNot(user, paymentMethodId);
            if (!otherMethods.isEmpty()) {
                PaymentMethod newDefault = otherMethods.get(0);
                newDefault.setIsDefault(true);
                paymentMethodRepository.save(newDefault);
                stripeService.setDefaultPaymentMethod(user.getStripeCustomerId(), newDefault.getStripePaymentMethodId());
            }
        }

        // Detach from Stripe
        stripeService.detachPaymentMethod(paymentMethod.getStripePaymentMethodId());

        // Delete from database
        paymentMethodRepository.delete(paymentMethod);
    }

    public List<PaymentMethod> getUserPaymentMethods(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentMethodRepository.findByUser(user);
    }

    private PaymentMethod.CardBrand convertCardBrand(String stripeBrand) {
        return switch (stripeBrand.toLowerCase()) {
            case "visa" -> PaymentMethod.CardBrand.VISA;
            case "mastercard" -> PaymentMethod.CardBrand.MASTERCARD;
            case "amex" -> PaymentMethod.CardBrand.AMERICAN_EXPRESS;
            case "discover" -> PaymentMethod.CardBrand.DISCOVER;
            default -> PaymentMethod.CardBrand.OTHER;
        };
    }
} 