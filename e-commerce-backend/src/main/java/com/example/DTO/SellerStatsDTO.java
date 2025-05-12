package com.example.DTO;

import lombok.Data;

@Data
public class SellerStatsDTO {
    private int totalProducts;
    private int totalOrders;
    private double totalRevenue;
    private double averageRating;
} 