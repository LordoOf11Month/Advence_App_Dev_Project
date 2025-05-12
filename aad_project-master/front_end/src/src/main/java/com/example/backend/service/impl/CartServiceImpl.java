package com.example.backend.service.impl;

import com.example.backend.dto.CartItemDTO;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductImage;
import com.example.backend.entity.User;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductImageRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductImageRepository productImageRepository;

    @Override
    public List<CartItemDTO> getCartItems() {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        return cartItemRepository.findByCart(cart).stream()
                .map(this::mapCartItemToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CartItemDTO addToCart(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }
        
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Find the product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        // Check if product is in stock
        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Not enough stock available");
        }
        
        // Check if product is already in cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProduct(cart, product);
        
        CartItem cartItem;
        if (existingCartItem.isPresent()) {
            // Update existing cart item
            cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        } else {
            // Create new cart item
            cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        }
        
        cartItem = cartItemRepository.save(cartItem);
        
        return mapCartItemToDTO(cartItem);
    }

    @Override
    @Transactional
    public void removeFromCart(Long cartItemId) {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));
        
        // Check if cart item belongs to the current user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to the current user's cart");
        }
        
        cartItemRepository.delete(cartItem);
    }

    @Override
    @Transactional
    public void clearCart() {
        User currentUser = getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        // Delete all cart items
        cartItemRepository.deleteByCart(cart);
    }

    @Override
    public int getCartItemCount() {
        User currentUser = getCurrentUser();
        
        try {
            Cart cart = getOrCreateCart(currentUser);
            List<CartItem> cartItems = cartItemRepository.findByCart(cart);
            
            return cartItems.stream()
                    .mapToInt(CartItem::getQuantity)
                    .sum();
        } catch (Exception e) {
            return 0;
        }
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("User not authenticated");
        }
        
        return (User) authentication.getPrincipal();
    }
    
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }
    
    private CartItemDTO mapCartItemToDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setProductId(cartItem.getProduct().getId());
        dto.setProductName(cartItem.getProduct().getName());
        dto.setQuantity(cartItem.getQuantity());
        dto.setPrice(cartItem.getProduct().getPrice());
        
        // Get primary image URL if available
        productImageRepository.findByProductAndPrimaryImageIsTrue(cartItem.getProduct())
                .ifPresent(primaryImage -> dto.setImageUrl(primaryImage.getImageUrl()));
        
        return dto;
    }

    public CartItemDTO updateCartItem(Long cartItemId, int quantity) {
        if (quantity <= 0) throw new BadRequestException("Quantity must be > 0");
        User user = getCurrentUser();
        Cart cart = getOrCreateCart(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + cartItemId));
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user");
        }
        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);
        return mapCartItemToDTO(cartItem);
    }
    
} 