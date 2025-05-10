package com.example.controllers;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    @GetMapping
    public List<String> listPaymentMethods() {
        // Logic to list payment methods
        return List.of("Credit Card", "PayPal", "Bank Transfer");
    }

    @PostMapping
    public String addPaymentMethod(@RequestBody String paymentMethod) {
        // Logic to add a new payment method
        return "Payment method added: " + paymentMethod;
    }

    @PutMapping("/{id}")
    public String updatePaymentMethod(@PathVariable String id, @RequestBody String paymentMethod) {
        // Logic to update an existing payment method
        return "Payment method updated: " + paymentMethod;
    }

    @DeleteMapping("/{id}")
    public String removePaymentMethod(@PathVariable String id) {
        // Logic to remove a payment method
        return "Payment method removed with id: " + id;
    }
}