package com.example.controllers;

import com.example.DTO.PaymentRequest;
import com.example.DTO.PaymentResponse;
import com.example.services.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentRequest paymentRequest) {
        try {
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(paymentRequest.getAmount(), paymentRequest.getCurrency());
            PaymentResponse paymentResponse = new PaymentResponse(paymentIntent.getClientSecret());
            return ResponseEntity.ok(paymentResponse);
        } catch (StripeException e) {
            // Log the error e.g., e.printStackTrace(); or using a logger
            // Depending on the nature of e.getMessage(), you might want to return a more generic error to the client.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating payment intent: " + e.getMessage());
        } catch (Exception e) {
            // Catch any other unexpected errors
            // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
} 