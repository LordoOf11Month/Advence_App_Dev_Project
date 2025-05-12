package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.IssueDTO;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.ProductDTO;
import com.example.backend.dto.TransactionDto;
import com.example.backend.dto.UserDTO;
import com.example.backend.service.OrderService;
import com.example.backend.service.ProductService;
import com.example.backend.service.TransactionService;
import com.example.backend.service.IssueService; // Add this import for IssueService
import com.example.backend.entity.Transaction; // Ensure this is the correct package for the Transaction class
import com.example.backend.service.UserService;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private ProductService productService;
    @Autowired
    private TransactionService transactionService;

    @Autowired
    private IssueService issueService; 
    
    // User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        List<UserDTO> users = userService.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.findDTOById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.update(id, userDTO);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
    
    @PutMapping("/users/{id}/ban")
    public ResponseEntity<ApiResponse<UserDTO>> banUser(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        UserDTO bannedUser = userService.banUser(id, reason);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully", bannedUser));
    }
    
    @PutMapping("/users/{id}/unban")
    public ResponseEntity<ApiResponse<UserDTO>> unbanUser(@PathVariable Long id) {
        UserDTO unbannedUser = userService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully", unbannedUser));
    }
    
    // Order Management
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getAllOrders() {
        List<OrderDTO> orders = orderService.findAllOrders();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @DeleteMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<?>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }
    
    // Product Management
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        List<ProductDTO> products = productService.findAll();
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
    
    // System Statistics
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = userService.getSystemStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/transactions")
    public List<TransactionDto> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllSellers() {
        List<UserDTO> sellers = userService.findAll().stream()
            .filter(u -> "SELLER".equals(u.getRole()))
            .collect(Collectors.toList());
        List<Map<String, Object>> result = sellers.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("roles", Collections.singletonList(u.getRole()));
            map.put("active", !u.isBanned());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // Create a seller
    @PostMapping("/sellers")
    public ResponseEntity<ApiResponse<UserDTO>> createSeller(@RequestBody UserDTO userDTO) {
        userDTO.setRole("SELLER");
        UserDTO newSeller = userService.register(userDTO);
        return ResponseEntity.ok(ApiResponse.success(newSeller));
    }

    // Update seller
    @PutMapping("/sellers/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateSeller(
            @PathVariable Long id, @RequestBody UserDTO userDTO) {
        UserDTO existing = userService.findDTOById(id);
        if (userDTO.getName() != null) existing.setName(userDTO.getName());
        if (userDTO.getSurname() != null) existing.setSurname(userDTO.getSurname());
        UserDTO updated = userService.update(id, existing);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    // Update order status (admin side)
    @PutMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        OrderDTO updated = orderService.updateOrderStatus(id, status, null);
        return ResponseEntity.ok(ApiResponse.success("Order updated", updated));
    }

    // List orders with open payment issues
    @GetMapping("/payment-issues")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getPaymentIssues() {
        List<IssueDTO> issues = issueService.getAllIssues().stream()
            .filter(i -> "PAYMENT".equals(i.getType()) && "OPEN".equals(i.getStatus()))
            .collect(Collectors.toList());
        List<OrderDTO> orders = issues.stream()
            .map(IssueDTO::getOrderItemId)
            .distinct()
            .map(orderService::findById)  // fetch the order by ID
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    // Resolve a payment issue
    @PutMapping("/payment-issues/{id}/resolve")
    public ResponseEntity<ApiResponse<?>> resolvePaymentIssue(@PathVariable Long id) {
        issueService.resolveIssue(id, null);
        return ResponseEntity.ok(ApiResponse.success("Issue resolved", null));
    }

    // Reviews Management
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllReviews() {
        List<Map<String, Object>> reviews = productService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
    
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<?>> deleteReview(@PathVariable Long id) {
        productService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
    
    // Ban sellers specifically
    @PutMapping("/sellers/{id}/ban")
    public ResponseEntity<ApiResponse<?>> banSeller(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        UserDTO seller = userService.findDTOById(id);
        
        if (!"SELLER".equals(seller.getRole())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User is not a seller"));
        }
        
        UserDTO bannedSeller = userService.banUser(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Seller banned successfully", bannedSeller));
    }
    
    // Update Shipment Status
    @PutMapping("/orders/{id}/shipment")
    public ResponseEntity<ApiResponse<?>> updateShipmentStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (!List.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED").contains(status)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid shipment status"));
        }
        
        OrderDTO updated = orderService.updateOrderStatus(id, status, null);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated", updated));
    }
} 