package com.example.controllers;

import org.springframework.web.bind.annotation.*;

import com.example.models.CartItem;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @GetMapping
    public List<CartItem> getCartItems() {
        // Logic to retrieve cart items
        return null;
    }

    @PostMapping("/add")
    public void addItemToCart(@RequestBody CartItem cartItem) {
        // Logic to add item to cart
    }

    @PutMapping("/update")
    public void updateCartItem(@RequestBody CartItem cartItem) {
        // Logic to update cart item quantity
    }

    @PostMapping("/apply-promo")
    public void applyPromoCode(@RequestParam String promoCode) {
        // Logic to apply promo code
    }
}