package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentIntent(@RequestBody Map<String, Object> data) {
        if (data.get("orderId") == null) {
            throw new BadRequestException("Missing required field: orderId");
        }
        
        try {
            Long orderId = ((Number) data.get("orderId")).longValue();
            String clientSecret = paymentService.createPaymentIntent(orderId);
            return ResponseEntity.ok(ApiResponse.success(Map.of("clientSecret", clientSecret)));
        } catch (ClassCastException e) {
            throw new BadRequestException("Invalid orderId format: must be a number");
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<String>> confirmPayment(@RequestBody Map<String, String> data) {
        String paymentIntentId = data.get("paymentIntentId");
        System.out.println("Received payment confirmation request for paymentIntentId: " + paymentIntentId);
        
        if (paymentIntentId == null || paymentIntentId.isEmpty()) {
            System.err.println("Missing paymentIntentId in request");
            throw new BadRequestException("Missing required field: paymentIntentId");
        }
        
        try {
            paymentService.confirmPayment(paymentIntentId);
            System.out.println("Payment confirmation successful for: " + paymentIntentId);
            return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", null));
        } catch (Exception e) {
            System.err.println("Error confirming payment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/refund")
   public ResponseEntity<ApiResponse<String>> refundPayment(
        @RequestParam("orderId") Long orderId) {
        paymentService.processRefund(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", null));
    }

    @PutMapping("/ensure-transaction")
    public ResponseEntity<ApiResponse<String>> ensureTransactionExists(@RequestBody Map<String, Object> data) {
        if (data.get("orderId") == null) {
            throw new BadRequestException("Missing required field: orderId");
        }
        
        try {
            Long orderId = ((Number) data.get("orderId")).longValue();
            boolean created = paymentService.ensureTransactionExists(orderId);
            String message = created ? "Transaction created for order" : "Transaction already existed";
            return ResponseEntity.ok(ApiResponse.success(message, null));
        } catch (ClassCastException e) {
            throw new BadRequestException("Invalid orderId format: must be a number");
        }
    }
}
