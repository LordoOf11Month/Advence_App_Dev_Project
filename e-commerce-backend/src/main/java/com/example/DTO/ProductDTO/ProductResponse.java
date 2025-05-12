package com.example.DTO.ProductDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    // private String category; // Old field
    private String categoryName; // New field for category name
    private String categorySlug; // New field for category slug
    private boolean inStock;
    private int stockQuantity;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean freeShipping;
    private boolean fastDelivery;
    private Long storeId;
    private String storeName;
    private Long sellerId;
    private String sellerName;

    // Lombok's @Getter and @Setter at class level should cover all fields.
} 