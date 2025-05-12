package com.example.controllers.Public;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.controllers.customer.CustomerReviewController.ReviewResponse;
import com.example.models.Review;
import com.example.repositories.ReviewRepository;

@RestController
@RequestMapping("/api/public/reviews")
public class PublicReviewController {
    private final ReviewRepository reviewRepository;

    public PublicReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/product/{productId}")
    public Map<String, Object> getReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        
        // Calculate average rating
        double averageRating = 0;
        if (!reviews.isEmpty()) {
            averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0);
        }
        
        // Map to DTOs to avoid serialization issues
        List<ReviewResponse> reviewDtos = reviews.stream()
            .map(ReviewResponse::new)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("reviews", reviewDtos);
        response.put("total", reviews.size());
        response.put("averageRating", averageRating);
        
        return response;
    }
} 