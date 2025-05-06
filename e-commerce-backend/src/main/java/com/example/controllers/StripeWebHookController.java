package com.example.controllers;

import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebHookController {
//
//    @Value("${stripe.webhookSecret}")
//    private String webhookSecret;
//
//    @PostMapping("/webhook")
//    public ResponseEntity<String> handleWebhook(
//            @RequestBody String payload,
//            @RequestHeader("Stripe-Signature") String sigHeader) {
//        Event event;
//        try {
//            // Verify signature and parse event
//            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
//        } catch (Exception e) {
//            // Invalid signature or payload
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("");
//        }
//
//        // Handle the event
//        if ("payment_intent.succeeded".equals(event.getType())) {
//            PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
//                    .getObject().orElse(null);
//            if (intent != null) {
//                String intentId = intent.getId();
//                // TODO: lookup Order by intentId and mark payment as succeeded
//                // e.g., order.setStripePaymentStatus(intent.getStatus()); save order...
//            }
//        }
////        else if ("payment_intent.payment_failed".equals(event.getType())) {
////            PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
////                    .getObject().orElse(null);
////            if (intent != null) {
////                // TODO: mark order/payment as failed
////            }
////        }
//        // Handle other event types (e.g. refunds) as needed
//
//        return ResponseEntity.ok("");
//    }
}
