package com.example.controllers.seller;

import com.example.DTO.OrderDTO;
import com.example.DTO.admin.AdminOrderDTO;
import com.example.services.OrderService;
import com.example.services.RefundService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller/orders")
@PreAuthorize("hasRole('SELLER')")
public class SellerOrderController {
    private final OrderService orderService;
    private final RefundService refundService;

    @Autowired
    public SellerOrderController(OrderService orderService, RefundService refundService) {
        this.orderService = orderService;
        this.refundService = refundService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        AdminOrderDTO.AdminOrderFilterRequest filter = new AdminOrderDTO.AdminOrderFilterRequest();
        filter.setOrderStatus(status);
        return ResponseEntity.ok(orderService.findAllAdminOrders(filter, page, size));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO.OrderResponse> getOrderDetails(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderForCurrentUser(orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO.OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminOrderDTO.UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    // Refund handling endpoints
    @GetMapping("/{orderId}/refunds")
    public ResponseEntity<Map<String, Object>> getOrderRefunds(@PathVariable Long orderId) {
        return ResponseEntity.ok(Map.of(
            "refunds", refundService.getRefundsForOrder(orderId)
        ));
    }

    @PostMapping("/{orderId}/refunds/{itemId}/process")
    public ResponseEntity<OrderDTO.RefundResponseDTO> processRefund(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @Valid @RequestBody OrderDTO.ProcessRefundDTO request) {
        return ResponseEntity.ok(refundService.processRefund(request));
    }

    @PostMapping("/{orderId}/refunds/{itemId}/reject")
    public ResponseEntity<OrderDTO.RefundResponseDTO> rejectRefund(
            @PathVariable Long orderId,
            @PathVariable Long itemId,
            @Valid @RequestBody OrderDTO.RejectRefundDTO request) {
        return ResponseEntity.ok(refundService.rejectRefund(request));
    }
} 