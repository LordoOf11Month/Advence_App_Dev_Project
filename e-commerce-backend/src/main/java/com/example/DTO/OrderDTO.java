package com.example.DTO;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

public class OrderDTO {

    @Data
    public static class OrderResponse {
        private String id;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<OrderItemDTO> items;
        private BigDecimal subtotal;
        private BigDecimal shipping;
        private BigDecimal total;
    }

    @Data
    public static class OrderItemDTO {
        @NotNull
        private Long productId;

        @NotNull
        private ProductDTO.CreateProductRequest product;

        @NotNull
        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity;

        private double priceAtPurchase;
    }

    @Data
    public static class CreateOrderRequest {
        @NotEmpty
        private List<OrderItemDTO> items;
        @NotNull
        private ShippingAddressDTO shippingAddress;
        @NotBlank
        private String stripePaymentChargeId;
    }

    @Data
    public static class ShippingAddressDTO {
        @NotBlank
        private String address1;
        private String address2;
        @NotBlank
        private String city;
        @NotBlank
        private String state;
        @NotBlank
        private String postalCode;
        @NotBlank
        private String country;
    }

    @Data
    public static class RefundRequestDTO {
        @NotNull
        private Long orderItemId;
        
        @NotBlank
        private String reason;
    }

    @Data
    public static class RefundResponseDTO {
        private Long orderItemId;
        private String status;
        private String reason;
        private BigDecimal refundAmount;
        private String rejectionReason;
        private LocalDateTime requestedAt;
        private LocalDateTime processedAt;
    }

    @Data
    public static class ProcessRefundDTO {
        @NotNull
        private Long orderItemId;
        
        @NotNull
        @DecimalMin(value = "0.01")
        private BigDecimal refundAmount;
        
        @NotBlank
        private String reason;
    }

    @Data
    public static class RejectRefundDTO {
        @NotNull
        private Long orderItemId;
        
        @NotBlank
        private String rejectionReason;
    }
}