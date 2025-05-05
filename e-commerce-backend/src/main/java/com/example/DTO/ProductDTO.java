package com.example.DTO;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

public class ProductDTO {

    @Data
    public static class ProductResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private String category;
        private String brand;
        private List<String> images;
        private boolean inStock;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
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
        @NotBlank
        private String brand;
    }

    @Data // From Lombok, generates getters, setters, etc.
    public static class ProductFilterRequest {
        private String search; // Search string for product name or description
        private Double minPrice; // Minimum price
        private Double maxPrice; // Maximum price
        private Double minRating; // Minimum rating
        private List<String> categories; // List of categories
    }


}