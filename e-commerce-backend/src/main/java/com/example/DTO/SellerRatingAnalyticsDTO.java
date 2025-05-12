package com.example.DTO;

import lombok.Data;
import java.util.Map;

@Data
public class SellerRatingAnalyticsDTO {
    private double averageRating;
    private int totalReviews;
    private Map<String, Integer> ratingDistribution;
} 