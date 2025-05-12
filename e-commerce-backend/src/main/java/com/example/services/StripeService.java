package com.example.services;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.PaymentMethodAttachParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    /**
     * Initialize a Stripe customer for a new user
     */
    public String createCustomer(String email, String name) throws StripeException {
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(email)
                .setName(name)
                .build();

        Customer customer = Customer.create(params);
        return customer.getId();
    }

    /**
     * Attach a payment method to a customer
     */
    public PaymentMethod attachPaymentMethod(String customerId, String paymentMethodId) throws StripeException {
        PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
        PaymentMethodAttachParams params = PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build();
        
        return paymentMethod.attach(params);
    }

    /**
     * Get payment method details
     */
    public PaymentMethod getPaymentMethod(String paymentMethodId) throws StripeException {
        return PaymentMethod.retrieve(paymentMethodId);
    }

    /**
     * Set a payment method as default for a customer
     */
    public void setDefaultPaymentMethod(String customerId, String paymentMethodId) throws StripeException {
        Customer customer = Customer.retrieve(customerId);
        CustomerUpdateParams params = CustomerUpdateParams.builder()
                .setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
                        .setDefaultPaymentMethod(paymentMethodId)
                        .build())
                .build();
        
        customer.update(params);
    }

    /**
     * Detach a payment method from a customer
     */
    public void detachPaymentMethod(String paymentMethodId) throws StripeException {
        PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
        paymentMethod.detach();
    }

    /**
     * Create a payment intent and return both payment intent ID and client secret
     */
    public Map<String, String> createPaymentIntent(String customerId, Long amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setCustomer(customerId)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        return Map.of(
            "paymentIntentId", paymentIntent.getId(),
            "clientSecret", paymentIntent.getClientSecret()
        );
    }

    /**
     * Confirm a payment intent and return the charge ID
     */
    public String confirmPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        
        if (!"succeeded".equals(paymentIntent.getStatus())) {
            throw new RuntimeException("Payment intent is not in succeeded state");
        }

        return paymentIntent.getLatestCharge();
    }

    /**
     * Process a refund for an order item
     */
    public String processRefund(String chargeId, Long amount, String reason) throws StripeException {
        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setCharge(chargeId);

        if (amount != null) {
            paramsBuilder.setAmount(amount);
        }

        if (reason != null) {
            paramsBuilder.setReason(RefundCreateParams.Reason.valueOf(reason.toUpperCase()));
        }

        Refund refund = Refund.create(paramsBuilder.build());
        return refund.getId();
    }

    /**
     * Get payment intent details
     */
    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Get refund details
     */
    public Refund getRefund(String refundId) throws StripeException {
        return Refund.retrieve(refundId);
    }

    public PaymentIntent createPaymentIntent(int amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) amount)
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                )
                .build();

        return PaymentIntent.create(params);
    }
} 