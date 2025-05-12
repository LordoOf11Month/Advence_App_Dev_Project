package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private Long storeId;
    private Long categoryId;
    private String storeName;
    private String categoryName;
    private List<String> imageUrls;

    private Long sellerId;    // New field for seller
    private String sellerName; // New field for seller's name
}
