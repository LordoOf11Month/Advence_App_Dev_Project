package com.example.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

public class ProductDetailDTO {

    @Data
    public static class ProductResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String category;
        private List<String> images;
        private boolean inStock;
        private Integer stockQuantity;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean freeShipping;
        private boolean fastDelivery;
        private Long storeId;
        private String storeName;
        private Long sellerId;
        private String sellerName;
    }

    // The static inner class CreateProductRequest has been moved to its own file:
    // e-commerce-backend/src/main/java/com/example/DTO/ProductDTO/CreateProductRequest.java

    // The static inner class ProductFilterRequest has been moved to its own file:
    // e-commerce-backend/src/main/java/com/example/DTO/ProductDTO/ProductFilterRequest.java
    /*
    public static class ProductFilterRequest {
        private String search; // Search string for product name or description
        private Double minPrice; // Minimum price
        private Double maxPrice; // Maximum price
        private Double minRating; // Minimum rating
        private List<String> categories; // List of categories
        private Boolean freeShipping; // Filter for free shipping products
        private Boolean fastDelivery; // Filter for fast delivery products
    }
    */
}