package com.example.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SellerPerformanceDTO {
    private String sellerId;
    private double totalSales;
    private int totalOrders;
    private double averageRating;
    private double cancelRate;
    private double returnRate;
    private Map<String, Double> monthlySales;
}
