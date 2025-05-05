package com.example.controllers;

//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebHookController {
//    @Autowired
//    private StripeWebhookService webhookService;
//
//    @PostMapping
//    public ResponseEntity<String> handleEvent(@RequestBody String payload,
//                                              @RequestHeader("Stripe-Signature") String sigHeader) {
//        try {
//            webhookService.processEvent(payload, sigHeader);
//            return ResponseEntity.ok("Webhook processed");
//        } catch (com.stripe.exception.SignatureVerificationException e) {
//            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
//                    .body("Invalid signature");
//        } catch (Exception e) {
//            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error processing webhook");
//        }
//    }
}