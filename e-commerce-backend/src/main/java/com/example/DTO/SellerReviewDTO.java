package com.example.DTO;

import lombok.Data;

@Data
public class SellerReviewDTO {
    private String id;
    private int rating;
    private String comment;
    private String customerName;
    private String reviewDate;
    private String sellerResponse;
} 