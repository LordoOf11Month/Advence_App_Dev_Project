package com.example.services;

import com.example.models.OrderItem;
import com.example.models.Refund;
import com.example.models.User;
import com.example.repositories.OrderItemRepository;
import com.example.repositories.RefundRepository;
import com.example.repositories.UserRepository;
import com.example.repositories.OrderRepository;
import com.example.models.OrderEntity;
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
    private final OrderRepository orderRepository;

    public StripeWebhookService(
            UserRepository userRepository,
            OrderItemRepository orderItemRepository,
            RefundRepository refundRepository,
            OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
        this.refundRepository = refundRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public void processEvent(String payload, String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        
        System.out.println("Processing Stripe webhook event: " + event.getType() + " [ID: " + event.getId() + "]");
        
        switch (event.getType()) {
            case "customer.created":
                handleCustomerCreated(event);
                break;
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(event);
                break;
            case "payment_intent.created":
                handlePaymentIntentCreated(event);
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
            case "refund.created":
                handleRefundCreated(event);
                break;
            case "refund.succeeded":
                handleRefundSucceeded(event);
                break;
            case "refund.failed":
                handleRefundFailed(event);
                break;
            case "refund.updated":
                handleRefundUpdated(event);
                break;
            case "charge.refund.updated":
                handleChargeRefundUpdated(event);
                break;
            default:
                System.out.println("Unhandled event type: " + event.getType() + " [ID: " + event.getId() + "]");
        }
    }

    @SuppressWarnings("deprecation")
    private void handleCustomerCreated(Event event) {
        Customer customer = (Customer) event.getData().getObject();
        // Find user by email and update Stripe customer ID
        userRepository.findByEmail(customer.getEmail())
                .ifPresent(user -> {
                    user.setStripeCustomerId(customer.getId());
                    userRepository.save(user);
                });
    }

    private void handlePaymentIntentCreated(Event event) {
        try {
            PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
            System.out.println("Payment Intent Created: " + paymentIntent.getId());
            // Add any necessary handling for payment intent creation
        } catch (Exception e) {
            System.out.println("Error processing payment_intent.created event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @SuppressWarnings("deprecation")
    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getData().getObject();
        // Update order item with payment intent ID
        orderItemRepository.findByStripePaymentIntentId(paymentIntent.getId())
                .ifPresent(orderItem -> {
                    orderItem.setStripePaymentIntentId(paymentIntent.getId());
                    orderItemRepository.save(orderItem);
                });
    }

    @SuppressWarnings("deprecation")
    @Transactional
    private void handleChargeSucceeded(Event event) {
        Charge charge = (Charge) event.getData().getObject();
        
        // Get the payment intent ID
        String paymentIntentId = charge.getPaymentIntent();
        
        if (paymentIntentId == null || paymentIntentId.isEmpty()) {
            System.out.println("Warning: Charge doesn't have a payment intent ID: " + charge.getId());
            return;
        }
        
        // Find the order item associated with this payment intent
        OrderItem orderItem = orderItemRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElse(null);
                
        if (orderItem == null) {
            System.out.println("Warning: Could not find order item for payment intent: " + paymentIntentId);
            return;
        }
        
        // Update order item with charge ID
        orderItem.setStripeChargeId(charge.getId());
        orderItemRepository.save(orderItem);
        
        // Get the parent order
        OrderEntity order = orderItem.getOrder();
        if (order == null) {
            System.out.println("Warning: Order item has no associated order");
            return;
        }
        
        // Check if all items in the order are now paid
        boolean allItemsPaid = true;
        for (OrderItem item : order.getOrderItems()) {
            if (item.getStripeChargeId() == null) {
                allItemsPaid = false;
                break;
            }
        }
        
        // Update order status if all items are paid
        if (allItemsPaid) {
            System.out.println("All items paid for order ID: " + order.getId() + ". Updating status to processing.");
            order.setStatus(OrderEntity.Status.processing);
            order.setStripeChargeId(charge.getId());
            orderRepository.save(order);
        }
    }

    @SuppressWarnings("deprecation")
    private void handleChargeRefunded(Event event) {
        try {
            Charge charge = (Charge) event.getData().getObject();
            if (charge.getRefunds() != null && !charge.getRefunds().getData().isEmpty()) {
                String refundId = charge.getRefunds().getData().get(0).getId();
                Optional<Refund> refundOpt = refundRepository.findByStripeRefundId(refundId);
                if (refundOpt.isPresent()) {
                    Refund refund = refundOpt.get();
                    refund.setStatus(Refund.RefundStatus.COMPLETED);
                    refund.setProcessedAt(LocalDateTime.now());
                    refundRepository.save(refund);
                } else {
                    System.out.println("Warning: Refund with ID " + refundId + " not found in database");
                }
            } else {
                System.out.println("Warning: No refunds found in charge " + charge.getId());
            }
        } catch (Exception e) {
            System.out.println("Error processing charge.refunded event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @SuppressWarnings("deprecation")
    private void handleChargeFailed(Event event) {
        Charge charge = (Charge) event.getData().getObject();
        // Update order item status or handle failed payment
        orderItemRepository.findByStripePaymentIntentId(charge.getPaymentIntent())
                .ifPresent(orderItem -> {
                    // Handle failed payment logic
                    orderItemRepository.save(orderItem);
                });
    }

    private void handleRefundCreated(Event event) {
        try {
            com.stripe.model.Refund refund = (com.stripe.model.Refund) event.getData().getObject();
            System.out.println("Refund Created: " + refund.getId() + " for charge: " + refund.getCharge());
            // Add any necessary handling for refund creation
        } catch (Exception e) {
            System.out.println("Error processing refund.created event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @SuppressWarnings("deprecation")
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

    @SuppressWarnings("deprecation")
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

    private void handleRefundUpdated(Event event) {
        try {
            com.stripe.model.Refund refund = (com.stripe.model.Refund) event.getData().getObject();
            System.out.println("Refund Updated: " + refund.getId() + " Status: " + refund.getStatus());
            // Add any necessary handling for refund updates
        } catch (Exception e) {
            System.out.println("Error processing refund.updated event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleChargeRefundUpdated(Event event) {
        try {
            Charge charge = (Charge) event.getData().getObject();
            System.out.println("Charge Refund Updated: " + charge.getId());
            // Add any necessary handling for charge refund updates
        } catch (Exception e) {
            System.out.println("Error processing charge.refund.updated event: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 