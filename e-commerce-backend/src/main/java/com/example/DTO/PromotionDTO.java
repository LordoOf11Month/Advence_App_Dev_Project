package com.example.DTO;

import lombok.Data;

@Data
public class PromotionDTO {
    private String id;
    private String name;
    private double discountPercentage;
    private String startDate;
    private String endDate;
    private boolean active;
} 