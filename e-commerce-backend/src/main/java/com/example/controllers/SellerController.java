package com.example.controllers;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    @GetMapping
    public String listSellers() {
        return "List of sellers";
    }

    @GetMapping("/{id}")
    public String getSellerProfile(@PathVariable String id) {
        return "Seller profile for ID: " + id;
    }

    @PostMapping
    public String createSeller(@RequestBody String seller) {
        return "Seller created: " + seller;
    }

    @PutMapping("/{id}")
    public String updateSeller(@PathVariable String id, @RequestBody String seller) {
        return "Seller updated: " + seller + " for ID: " + id;
    }

    @DeleteMapping("/{id}")
    public String deleteSeller(@PathVariable String id) {
        return "Seller deleted with ID: " + id;
    }
}