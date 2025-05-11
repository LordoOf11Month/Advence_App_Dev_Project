package com.example.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class ProductDTO {

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

    @Data
    public static class CreateProductRequest {
        @NotBlank @Size(max = 255)
        private String title;
        @NotBlank @Size(max = 1000)
        private String description;
        @NotNull @Positive
        private BigDecimal price;
        @NotBlank
        private String category;
        private Integer stockQuantity;
        @NotEmpty
        private List<String> imageUrls; // List of image URLs to be stored
        private boolean freeShipping;
        private boolean fastDelivery;
    }

    @Data
    public static class ProductFilterRequest {
        private String search; // Search string for product name or description
        private Double minPrice; // Minimum price
        private Double maxPrice; // Maximum price
        private Double minRating; // Minimum rating
        private List<String> categories; // List of categories
        private Boolean freeShipping; // Filter for free shipping products
        private Boolean fastDelivery; // Filter for fast delivery products
    }
}