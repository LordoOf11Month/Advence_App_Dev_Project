package com.example.controllers;


import com.example.DTO.PaymentDTO;
import com.example.services.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping(PaymentController.BASE_API_PATH)
@Validated
public class PaymentController {

    public static final String BASE_API_PATH = "/api/payment";
    public static final String CREATE_INTENT_PATH = "/create-intent";
    public static final String REFUND_PATH = "/refund";

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping(CREATE_INTENT_PATH)
    public ResponseEntity<Map<String, String>> createIntent(@RequestBody @Valid PaymentDTO.PaymentRequest paymentRequest) throws StripeException {
        String clientSecret = paymentService.createPaymentIntent(paymentRequest);
        return ResponseEntity.ok(Collections.singletonMap("clientSecret", clientSecret));
    }

    @PostMapping(REFUND_PATH)
    public ResponseEntity<Refund> refund(@RequestBody @Valid RefundRequest refundRequest) throws StripeException {
        Refund refund = paymentService.refundPayment(refundRequest.getPaymentIntentId(), refundRequest.getAmount());
        return ResponseEntity.ok(refund);
    }

    public static class RefundRequest {
        @NotBlank
        private String paymentIntentId;

        @NotNull
        @Positive
        private Long amount;

        public String getPaymentIntentId() { return paymentIntentId; }
        public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }

        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
    }
}