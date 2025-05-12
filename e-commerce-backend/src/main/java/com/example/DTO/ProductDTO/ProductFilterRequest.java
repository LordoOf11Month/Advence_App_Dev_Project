package com.example.DTO.ProductDTO;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter; // Using BigDecimal for price as is best practice
import lombok.Setter;

@Getter
@Setter
public class ProductFilterRequest {
    private String search;
    private BigDecimal minPrice; // Changed from Double to BigDecimal
    private BigDecimal maxPrice; // Changed from Double to BigDecimal
    private Double minRating;
    private List<String> categories;
    private Boolean freeShipping;
    private Boolean fastDelivery;

    // Lombok will generate getters and setters
} 