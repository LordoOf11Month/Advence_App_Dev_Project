package com.example.backend.controller;

import com.example.backend.dto.UserDTO;
import com.example.backend.service.UserService;
import com.example.backend.service.OrderService;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired private UserService userService;
    @Autowired private OrderService orderService;

    // Get current user profile
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserDTO userDTO = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }
    
    // Update current user profile (excluding primary key/id)
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@RequestBody UserDTO userDTO) {
        UserDTO current = userService.getCurrentUser();
        UserDTO updated = userService.update(current.getId(), userDTO);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
    
    // Checkout: create a new order with cart, address, payment
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDTO>> checkout(
            @RequestBody OrderDTO orderDTO,
            Authentication authentication) {
        OrderDTO createdOrder = orderService.createOrder(orderDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", createdOrder));
    }
    
    // View user's own orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getUserOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.findUserOrders(authentication);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    // Register as a seller (upgrade role if not already)
    @PostMapping("/become-seller")
    public ResponseEntity<ApiResponse<UserDTO>> becomeSeller(Authentication authentication) {
        UserDTO currentUser = userService.findByAuthentication(authentication);
        // Prepare a UserDTO to update the role
        UserDTO updateDto = new UserDTO();
        updateDto.setRole("SELLER");
        UserDTO updated = userService.update(currentUser.getId(), updateDto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
