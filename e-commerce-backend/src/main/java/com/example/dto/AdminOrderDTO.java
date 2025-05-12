package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    private List<OrderItemDTO> items;
    
    @Data
    public static class OrderItemDTO {
        private String productId;
        private String productName;
        private int quantity;
        private double price;
    }
}
