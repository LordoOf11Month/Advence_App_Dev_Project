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
         @NotNull// Based on OrderItem.product relationship constraint
        private ProductDTO.CreateProductRequest product;

        @NotNull // Added for consistency, although primitive int cannot be null
        @Min(value = 1, message = "Quantity must be at least 1") // Based on OrderItem.quantity non-null constraint and logic
        private int quantity;

        private BigDecimal priceAtPurchase;
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
}