package com.example.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.models.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Basic finder methods
    List<Review> findByUserId(int userId);
    List<Review> findByProductId(Long productId);
    
    // Find a specific review by product and user
    Optional<Review> findByProductIdAndUserId(Long productId, int userId);
    
    // Check if a review exists
    boolean existsByProductIdAndUserId(Long productId, int userId);
    
    // Sorting methods
    List<Review> findByProductIdOrderByRatingDesc(Long productId);
    List<Review> findByProductIdOrderByRatingAsc(Long productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
}