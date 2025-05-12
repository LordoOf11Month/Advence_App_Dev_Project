package com.example.dto;

import lombok.Data;

@Data
public class AdminSellerDTO {
    private String id;
    private String storeName;
    private String ownerName;
    private String email;
    private String registrationDate;
    private boolean approved;
    private int totalProducts;
    private double totalRevenue;
    private double commissionRate;
    private double rating;
}
