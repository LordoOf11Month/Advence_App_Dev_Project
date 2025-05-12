package com.example.controllers.customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.services.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.Stripe;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/payments")
public class CustomerPaymentController {

    @Autowired
    private StripeService stripeService;

    /**
     * Create a payment intent
     * 
     * @param requestBody Map containing amount and currency
     * @return Payment intent client secret and ID
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> requestBody) {
        try {
            // Parse amount and currency from request body
            Long amount = ((Number) requestBody.get("amount")).longValue();
            String currency = (String) requestBody.getOrDefault("currency", "usd");
            
            // Create payment intent directly using Stripe API
            // This avoids the need for a customer ID
            Stripe.apiKey = stripeService.getStripeApiKey();
            
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount)
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            
            Map<String, String> response = new HashMap<>();
            response.put("paymentIntentId", paymentIntent.getId());
            response.put("clientSecret", paymentIntent.getClientSecret());
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment intent: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Confirm a payment
     * 
     * @param requestBody Map containing paymentIntentId
     * @return Confirmation result
     */
    @PostMapping("/confirm-payment")
    public ResponseEntity<Map<String, String>> confirmPayment(@RequestBody Map<String, String> requestBody) {
        try {
            String paymentIntentId = requestBody.get("paymentIntentId");
            if (paymentIntentId == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Payment intent ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            String chargeId = stripeService.confirmPaymentIntent(paymentIntentId);
            
            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("chargeId", chargeId);
            
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to confirm payment: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
} 