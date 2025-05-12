package com.example.backend.service;

import com.example.backend.dto.CartItemDTO;
import java.util.List;

public interface CartService {
    List<CartItemDTO> getCartItems();
    CartItemDTO addToCart(Long productId, int quantity);
    void removeFromCart(Long cartItemId);
    void clearCart();
    int getCartItemCount();
    CartItemDTO updateCartItem(Long cartItemId, int quantity);
} 