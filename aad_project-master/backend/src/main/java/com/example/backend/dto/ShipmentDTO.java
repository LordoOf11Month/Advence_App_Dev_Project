package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDTO {
    private Long id;
    private Long orderId;
    private Long sellerId;
    private String status; // PENDING, SHIPPED, DELIVERED, CANCELLED
    private String trackingNumber;
    private String carrier;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String shippingAddress;
    private String recipientName;
    private String recipientPhone;
} 