package com.example.services;

import com.example.models.OrderItem;
import com.example.models.Refund;
import com.example.models.User;
import com.example.repositories.OrderItemRepository;
import com.example.repositories.RefundRepository;
import com.example.repositories.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class StripeWebhookService {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final RefundRepository refundRepository;

    public StripeWebhookService(
            UserRepository userRepository,
            OrderItemRepository orderItemRepository,
            RefundRepository refundRepository) {
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
        this.refundRepository = refundRepository;
    }

    @Transactional
    public void processEvent(String payload, String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        
        switch (event.getType()) {
            case "customer.created":
                handleCustomerCreated(event);
                break;
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "charge.succeeded":
                handleChargeSucceeded(event);
                break;
            case "charge.refunded":
                handleChargeRefunded(event);
                break;
            case "charge.failed":
                handleChargeFailed(event);
                break;
            case "refund.succeeded":
                handleRefundSucceeded(event);
                break;
            case "refund.failed":
                handleRefundFailed(event);
                break;
            default:
                // Log unhandled event types
                System.out.println("Unhandled event type: " + event.getType());
        }
    }

    private void handleCustomerCreated(Event event) {
        Customer customer = (Customer) event.getData().getObject();
        // Find user by email and update Stripe customer ID
        userRepository.findByEmail(customer.getEmail())
                .ifPresent(user -> {
                    user.setStripeCustomerId(customer.getId());
                    userRepository.save(user);
                });
    }

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
        // Update order item with payment intent ID
        orderItemRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .ifPresent(orderItem -> {
                    orderItem.setStripePaymentIntentId(paymentIntent.getId());
                    orderItemRepository.save(orderItem);
                });
    }

    private void handleChargeSucceeded(Event event) {
        Charge charge = (Charge) event.getData().getObject();
        // Update order item with charge ID
        orderItemRepository.findByStripePaymentIntentId(charge.getPaymentIntent())
                .ifPresent(orderItem -> {
                    orderItem.setStripeChargeId(charge.getId());
                    orderItemRepository.save(orderItem);
                });
    }

    private void handleChargeRefunded(Event event) {
        Charge charge = (Charge) event.getData().getObject();
        // Find and update refund status
        if (!charge.getRefunds().getData().isEmpty()) {
            String refundId = charge.getRefunds().getData().get(0).getId();
            refundRepository.findByStripeRefundId(refundId)
                    .ifPresent(refund -> {
                        refund.setStatus(Refund.RefundStatus.COMPLETED);
                        refund.setProcessedAt(LocalDateTime.now());
                        refundRepository.save(refund);
                    });
        }
    }

    private void handleChargeFailed(Event event) {
        Charge charge = (Charge) event.getData().getObject();
        // Update order item status or handle failed payment
        orderItemRepository.findByStripePaymentIntentId(charge.getPaymentIntent())
                .ifPresent(orderItem -> {
                    // Handle failed payment logic
                    orderItemRepository.save(orderItem);
                });
    }

    private void handleRefundSucceeded(Event event) {
        com.stripe.model.Refund stripeRefund = (com.stripe.model.Refund) event.getData().getObject();
        // Update refund status
        refundRepository.findByStripeRefundId(stripeRefund.getId())
                .ifPresent(existingRefund -> {
                    existingRefund.setStatus(Refund.RefundStatus.COMPLETED);
                    existingRefund.setProcessedAt(LocalDateTime.now());
                    refundRepository.save(existingRefund);
                });
    }

    private void handleRefundFailed(Event event) {
        com.stripe.model.Refund stripeRefund = (com.stripe.model.Refund) event.getData().getObject();
        // Update refund status
        refundRepository.findByStripeRefundId(stripeRefund.getId())
                .ifPresent(existingRefund -> {
                    existingRefund.setStatus(Refund.RefundStatus.FAILED);
                    existingRefund.setProcessedAt(LocalDateTime.now());
                    refundRepository.save(existingRefund);
                });
    }
} 