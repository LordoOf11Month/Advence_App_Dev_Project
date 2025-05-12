package com.example.services;

import com.example.models.PaymentMethod;
import com.example.models.User;
import com.example.repositories.PaymentMethodRepository;
import com.example.repositories.UserRepository;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StripeService stripeService;

    public List<PaymentMethod> getPaymentMethodsForUser(User user) {
        return paymentMethodRepository.findByUser(user);
    }

    @Transactional
    public PaymentMethod addPaymentMethod(User user, String stripePaymentMethodId) throws StripeException {
        // Verify the payment method exists in Stripe
        com.stripe.model.PaymentMethod stripePaymentMethod = stripeService.getPaymentMethod(stripePaymentMethodId);
        if (stripePaymentMethod == null) {
            throw new RuntimeException("Payment method not found in Stripe");
        }

        // Check if payment method already exists
        if (paymentMethodRepository.existsById(stripePaymentMethodId)) {
            throw new RuntimeException("Payment method already exists");
        }

        // Create new payment method
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setStripePaymentMethodId(stripePaymentMethodId);
        paymentMethod.setUser(user);
        paymentMethod.setBrand(PaymentMethod.CardBrand.valueOf(stripePaymentMethod.getCard().getBrand().toUpperCase()));
        paymentMethod.setLast4Digits(stripePaymentMethod.getCard().getLast4());
        paymentMethod.setExpMonth(stripePaymentMethod.getCard().getExpMonth().intValue());
        paymentMethod.setExpYear(stripePaymentMethod.getCard().getExpYear().intValue());

        // If this is the first payment method, set it as default
        if (paymentMethodRepository.countByUser(user) == 0) {
            paymentMethod.setIsDefault(true);
        }

        return paymentMethodRepository.save(paymentMethod);
    }

    @Transactional
    public PaymentMethod setDefaultPaymentMethod(User user, String stripePaymentMethodId) {
        // Verify the payment method exists and belongs to the user
        PaymentMethod paymentMethod = paymentMethodRepository.findById(stripePaymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        if (paymentMethod.getUser().getId() != user.getId()) {
            throw new RuntimeException("Payment method does not belong to user");
        }

        // Set all user's payment methods to non-default
        List<PaymentMethod> userPaymentMethods = paymentMethodRepository.findByUser(user);
        userPaymentMethods.forEach(pm -> pm.setIsDefault(false));
        paymentMethodRepository.saveAll(userPaymentMethods);

        // Set the selected payment method as default
        paymentMethod.setIsDefault(true);
        return paymentMethodRepository.save(paymentMethod);
    }

    @Transactional
    public void removePaymentMethod(User user, String stripePaymentMethodId) throws StripeException {
        // Verify the payment method exists and belongs to the user
        PaymentMethod paymentMethod = paymentMethodRepository.findById(stripePaymentMethodId)
                .orElseThrow(() -> new RuntimeException("Payment method not found"));

        if (paymentMethod.getUser().getId() != user.getId()) {
            throw new RuntimeException("Payment method does not belong to user");
        }

        // If this is the default payment method and there are other payment methods,
        // set another one as default
        if (paymentMethod.getIsDefault() && paymentMethodRepository.countByUser(user) > 1) {
            List<PaymentMethod> otherPaymentMethods = paymentMethodRepository.findByUserAndStripePaymentMethodIdNot(user, stripePaymentMethodId);
            if (!otherPaymentMethods.isEmpty()) {
                otherPaymentMethods.get(0).setIsDefault(true);
                paymentMethodRepository.save(otherPaymentMethods.get(0));
            }
        }

        // Delete the payment method from Stripe
        stripeService.detachPaymentMethod(stripePaymentMethodId);

        // Delete from database
        paymentMethodRepository.deleteById(stripePaymentMethodId);
    }
} 