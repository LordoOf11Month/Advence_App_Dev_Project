package com.example.DTO;

import lombok.Data;
import java.util.List;

@Data
public class SellerOrderDTO {
    private String id;
    private String customerName;
    private String orderDate;
    private String status;
    private double totalAmount;
    private List<OrderItemDTO> items;
    
    @Data
    public static class OrderItemDTO {
        private String productId;
        private String productName;
        private int quantity;
        private double price;
    }
} 