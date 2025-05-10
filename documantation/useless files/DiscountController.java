package com.example.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    @GetMapping
    public List<String> getActiveDiscounts() {
        // Logic to retrieve active discounts
        return List.of("Discount 1", "Discount 2");
    }

    // Additional methods for applying and removing discounts can be added here
}