package com.example.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.models.CartItem;
import com.example.models.Product;
import com.example.models.User;
import com.example.repositories.CartItemRepository;
import com.example.repositories.ProductRepository;
import com.example.repositories.UserRepository;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all cart items for a user
     */
    public List<CartItem> getCartItems(Integer userId) {
        return cartItemRepository.findByUser_Id(userId);
    }
    
    /**
     * Add an item to the cart
     */
    @Transactional
    public CartItem addItemToCart(Integer userId, Long productId, Integer quantity, String size, String color) {
        // Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if the item is already in the cart with the same size and color
        List<CartItem> userCart = cartItemRepository.findByUser_Id(userId);
        Optional<CartItem> existingItem = userCart.stream()
                .filter(item -> item.getProduct().getId().equals(productId) &&
                       (size == null || size.equals(item.getSize())) &&
                       (color == null || color.equals(item.getColor())))
                .findFirst();
        
        if (existingItem.isPresent()) {
            // Update existing item
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setSize(size);
            newItem.setColor(color);
            return cartItemRepository.save(newItem);
        }
    }
    
    /**
     * Update cart item quantity
     */
    @Transactional
    public CartItem updateCartItem(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }
    
    /**
     * Remove an item from the cart
     */
    @Transactional
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }
    
    /**
     * Clear user's cart
     */
    @Transactional
    public void clearCart(Integer userId) {
        List<CartItem> userItems = cartItemRepository.findByUser_Id(userId);
        cartItemRepository.deleteAll(userItems);
    }
} 