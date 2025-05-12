package com.example.backend.service;

import com.example.backend.dto.OrderDTO;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface OrderService {
    // Admin operations
    List<OrderDTO> findAllOrders();
    void deleteOrder(Long id);
    
    // Customer operations
    List<OrderDTO> findUserOrders(Authentication authentication);
    
    // Seller operations
    List<OrderDTO> findSellerOrders(Authentication authentication);
    
    // Common operations
    OrderDTO findById(Long id);
    OrderDTO createOrder(OrderDTO orderDTO, Authentication authentication);
    OrderDTO updateOrderStatus(Long id, String status, Authentication authentication);
    void cancelOrder(Long id, Authentication authentication);
    
    // Transaction reporting
    Map<String, Object> getSellerTransactions(String period, Authentication authentication);
    List<OrderDTO> findByUserId(Long id);
} 