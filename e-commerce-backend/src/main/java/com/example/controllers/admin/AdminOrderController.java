package com.example.controllers.admin;

import com.example.DTO.OrderDTO.OrderResponse;
import com.example.DTO.OrderDTO.CreateOrderRequest;
import com.example.DTO.admin.AdminOrderDTO.AdminOrderFilterRequest;
import com.example.DTO.admin.AdminOrderDTO.UpdateOrderStatusRequest;
import com.example.services.OrderService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllOrders(
            AdminOrderFilterRequest filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.findAllAdminOrders(filter, page, size));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @PostMapping("/for-user/{userId}")
    public ResponseEntity<Map<String, String>> createOrderForUser(
            @PathVariable Integer userId,
            @RequestBody CreateOrderRequest createDto) throws StripeException {
        return ResponseEntity.ok(orderService.createOrderForUser(userId, createDto));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok().build();
    }
} 