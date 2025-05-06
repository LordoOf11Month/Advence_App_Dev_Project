package com.example.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.CartItemDTO;
import com.example.models.CartItem;
import com.example.models.User;
import com.example.security.CustomUserDetails;
import com.example.services.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @Autowired
    private CartService cartService;

    /**
     * Get all cart items for the logged-in user
     */
    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = extractUserFromAuth(auth);
        return ResponseEntity.ok(cartService.getCartItems(user.getId()));
    }

    /**
     * Add an item to the cart
     */
    @PostMapping("/add")
    public ResponseEntity<CartItem> addItemToCart(@RequestBody CartItemDTO cartItemDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = extractUserFromAuth(auth);
        
        CartItem cartItem = cartService.addItemToCart(
            user.getId(), 
            cartItemDTO.getProductId(), 
            cartItemDTO.getQuantity(),
            cartItemDTO.getSize(),
            cartItemDTO.getColor()
        );
        
        return new ResponseEntity<>(cartItem, HttpStatus.CREATED);
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        
        return ResponseEntity.ok(
            cartService.updateCartItem(cartItemId, quantity)
        );
    }
    
    /**
     * Remove an item from the cart
     */
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Clear user's cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = extractUserFromAuth(auth);
        
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Helper method to extract User from Authentication object
     * Handles both User and CustomUserDetails objects
     */
    private User extractUserFromAuth(Authentication auth) {
        if (auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        } else if (auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getUser();
        } else {
            throw new RuntimeException("Unexpected authentication principal type: " + 
                                       auth.getPrincipal().getClass().getName());
        }
    }
}