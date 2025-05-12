package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CartItemDTO;
import com.example.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    
    @Autowired
    private CartService cartService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemDTO>>> getCartItems() {
        List<CartItemDTO> cartItems = cartService.getCartItems();
        return ResponseEntity.ok(ApiResponse.success("Cart items retrieved successfully", cartItems));
    }
    
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getCartItemCount() {
        int count = cartService.getCartItemCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }
    
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartItemDTO>> addToCart(@RequestParam Long productId, @RequestParam int quantity) {
        CartItemDTO cartItem = cartService.addToCart(productId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cartItem));
    }
    
    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<?>> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<?>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }

    @PutMapping("/items/{id}")
public ResponseEntity<ApiResponse<CartItemDTO>> updateCartItem(
        @PathVariable Long id, @RequestBody Map<String, Integer> body) {
    int quantity = body.get("quantity");
    CartItemDTO updated = cartService.updateCartItem(id, quantity);
    return ResponseEntity.ok(ApiResponse.success("Cart item updated", updated));
}

} 