package com.example.DTO.ProductDTO;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateProductRequest {
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