package com.example.repositories;

import com.example.models.Review;
import com.example.models.Review.ReviewId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, ReviewId> {
    // Custom query methods can be defined here if needed
    // For example, to find reviews by a specific user or product
    List<Review> findByUserId(int userId);
    List<Review> findByProductId(Long productId);
}