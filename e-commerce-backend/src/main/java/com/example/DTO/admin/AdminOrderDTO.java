package com.example.DTO.admin;

import java.time.LocalDateTime;
import java.util.ArrayList; // Assuming pagination
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminOrderDTO {
    private String id;
    private String customerId;
    private String customerName;
    private String orderDate;
    private String status;
    private double totalAmount;
    private String shippingAddress;
    private String paymentMethod;
    private boolean paymentResolved;
    private boolean issueResolved;
    private List<OrderItemDTO> items = new ArrayList<>();

    @Data
    public static class OrderItemDTO {
        private String productId;
        private String productName;
        private int quantity;
        private double price;
    }

    @Data
    public static class AdminOrderFilterRequest {
        private Long orderId;
        private Long storeId;
        private String storeName;
        private Long productId;
        private String productName;
        private String orderStatus; // Could be an Enum if you have defined OrderStatus
        private Integer customerId; // Assuming User ID is Integer from UserDTO.UserResponse
        private String customerEmail;
        private LocalDateTime minOrderDate;
        private LocalDateTime maxOrderDate;
        // Pageable will be handled as a method parameter in the controller/service
    }

    @Data
    public static class UpdateOrderStatusRequest {
        @NotBlank // Assuming status cannot be blank
        private String newStatus; // Could be an Enum
        private String reason; // Optional reason for status change
    }

} 