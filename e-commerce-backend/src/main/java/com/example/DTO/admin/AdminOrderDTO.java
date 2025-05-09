package com.example.DTO.admin;

import lombok.Data;
import org.springframework.data.domain.Pageable; // Assuming pagination
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class AdminOrderDTO {

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