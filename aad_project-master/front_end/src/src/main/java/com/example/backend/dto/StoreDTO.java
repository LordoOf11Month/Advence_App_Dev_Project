package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StoreDTO {
    private Long id;
    private Long sellerId;
    private String sellerName;
    private String storeName;
    private String description;
    private LocalDateTime createdAt;
} 