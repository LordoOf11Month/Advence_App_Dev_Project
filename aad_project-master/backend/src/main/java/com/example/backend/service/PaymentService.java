package com.example.backend.service;

public interface PaymentService {
    String createPaymentIntent(Long orderId);
    String getExistingPaymentIntent(Long orderId);
    void confirmPayment(String paymentIntentId);
    void processRefund(Long orderId);
    boolean ensureTransactionExists(Long orderId);
}
