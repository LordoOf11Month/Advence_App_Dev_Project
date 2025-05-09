package com.example.controllers.admin;

import com.example.DTO.OrderDTO;
import com.example.DTO.admin.AdminOrderDTO;
import com.example.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    @Autowired
    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<Page<OrderDTO.OrderResponse>> getAllOrders(
            AdminOrderDTO.AdminOrderFilterRequest filter,
            Pageable pageable) {
        Page<OrderDTO.OrderResponse> orders = orderService.findAllAdminOrders(filter, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO.OrderResponse> getOrderById(@PathVariable Long id) {
        return orderService.findById(id) // Assumes findById is available from GenericService
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDTO.OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminOrderDTO.UpdateOrderStatusRequest statusRequest) {
        try {
            OrderDTO.OrderResponse updatedOrder = orderService.updateOrderStatus(id, statusRequest);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) { // Catch specific exceptions like OrderNotFound or InvalidStatus
            // Log error e.g. e.getMessage()
            return ResponseEntity.badRequest().build(); // Or more specific error codes
        }
    }

    // Optional: If you want to expose the generic update from GenericService
    // @PutMapping("/{id}")
    // public ResponseEntity<OrderDTO.OrderResponse> updateOrder(
    //         @PathVariable Long id,
    //         @Valid @RequestBody OrderDTO.CreateOrderRequest updateRequest) {
    //     try {
    //         OrderDTO.OrderResponse updatedOrder = orderService.update(id, updateRequest);
    //         return ResponseEntity.ok(updatedOrder);
    //     } catch (RuntimeException e) {
    //         return ResponseEntity.notFound().build(); // Or other appropriate error
    //     }
    // }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.delete(id); // Assumes delete is available from GenericService
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) { // e.g., if order not found or cannot be deleted
            return ResponseEntity.notFound().build();
        }
    }
    
    // CreateOrder endpoint for Admin - less common, but can be added if needed.
    // @PostMapping
    // public ResponseEntity<OrderDTO.OrderResponse> createOrder(
    //         @Valid @RequestBody OrderDTO.CreateOrderRequest createRequest) {
    //     try {
    //         OrderDTO.OrderResponse newOrder = orderService.save(createRequest);
    //         return ResponseEntity.status(HttpStatus.CREATED).body(newOrder);
    //     } catch (Exception e) {
    //         // Log error
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    //     }
    // }
} 