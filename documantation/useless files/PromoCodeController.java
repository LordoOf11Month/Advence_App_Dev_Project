package com.example.controllers;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promocodes")
public class PromoCodeController {

    @GetMapping
    public List<String> getAllPromoCodes() {
        // Logic to retrieve all promo codes
        return List.of("PROMO10", "PROMO20");
    }

    @GetMapping("/{id}")
    public String getPromoCodeById(@PathVariable String id) {
        // Logic to retrieve a specific promo code by ID
        return "PROMO10";
    }

    @PostMapping
    public String createPromoCode(@RequestBody String promoCode) {
        // Logic to create a new promo code
        return "Promo code created: " + promoCode;
    }

    @DeleteMapping("/{id}")
    public String deletePromoCode(@PathVariable String id) {
        // Logic to delete a promo code by ID
        return "Promo code deleted: " + id;
    }
}