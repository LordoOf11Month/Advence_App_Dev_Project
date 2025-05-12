package com.example.backend.service;

import com.example.backend.dto.ReviewDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ReviewService {
    List<ReviewDTO> getProductReviews(Long productId);
    List<ReviewDTO> getUserReviews(Authentication auth);
    ReviewDTO createReview(ReviewDTO reviewDTO, Authentication auth);
    ReviewDTO updateReview(Long id, ReviewDTO reviewDTO, Authentication auth);
    void deleteReview(Long id, Authentication auth);
} 