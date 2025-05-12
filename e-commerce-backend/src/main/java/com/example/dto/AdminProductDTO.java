package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductDTO {
    private String id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than zero")
    private BigDecimal price;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private String description;
    private List<String> images;
    private String imageUrl;
    private Boolean approved;
    private String status;
    private Boolean inStock;
    
    @NotNull(message = "Stock quantity is required")
    @Positive(message = "Stock quantity must be greater than zero")
    private Integer stock;
    
    private String sellerId;
    private String sellerName;
    private String storeName;
    private LocalDateTime dateAdded;
    private LocalDateTime lastUpdated;
    private Boolean freeShipping;
    private Boolean fastDelivery;
    private Double rating;
    private Integer reviewCount;
}
