package com.example.dto;

import lombok.Data;

@Data
public class AdminStatsDTO {
    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private double totalRevenue;
    private int monthlyUsers;
    private int monthlyProducts;
    private int monthlyOrders;
    private double monthlyRevenue;
}
