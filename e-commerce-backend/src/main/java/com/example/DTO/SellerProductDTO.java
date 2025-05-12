package com.example.DTO;

import lombok.Data;

@Data
public class SellerProductDTO {
    private String id;
    private String name;
    private double price;
    private String description;
    private String category;
    private int quantity;
    private String imageUrl;
} 