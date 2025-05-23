package com.example.DTO;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import com.example.models.Address;

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
        private BigDecimal tax;
        private CustomerDTO customer;
        private ShippingAddressDTO shippingAddress;
        private String trackingNumber;
        private LocalDate estimatedDelivery;
        private PaymentMethodDTO paymentMethod;
    }

    @Data
    public static class ShippingAddressDTO {
        private Integer id;
        private String street;
        private String city;
        private String state;
        private String country;
        private String zipCode;
        private String firstName;
        private String lastName;
        private String phone;
    }

    @Data
    public static class PaymentMethodDTO {
        private String type;
        private String cardNumber;
        private String cardholderName;
        private String expiryDate;
    }

    @Data
    public static class OrderItemDTO {
        @NotNull
        private Long productId;

        @NotNull
        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity;

        private BigDecimal priceAtPurchase;
        
        private String stripePaymentIntentId;
        private String clientSecret;
    }

    @Data
    public static class CreateOrderRequest {
        @NotEmpty
        private List<OrderItemDTO> items;
        
        // Either shippingAddressId or newShippingAddress must be provided
        private Integer shippingAddressId;
        
        // Allow creating a new address during order
        private AddressDTO.CreateAddressRequest newShippingAddress;
        
        // @NotBlank
        // private String paymentMethodId; // Stripe payment method ID
    }

    @Data
    public static class RefundRequestDTO {
        @NotNull
        private Long orderItemId;
        
        @NotBlank
        private String reason;
        
        private BigDecimal amount; // Optional: if not provided, refunds full amount
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

    @Data
    public static class AdminOrderFilterRequest {
        private String status;
        private String search;

        public AdminOrderFilterRequest(String status, String search) {
            this.status = status;
            this.search = search;
        }
    }

    @Data
    public static class UpdateOrderStatusRequest {
        @NotBlank
        private String newStatus;
        private String reason;
    }
}