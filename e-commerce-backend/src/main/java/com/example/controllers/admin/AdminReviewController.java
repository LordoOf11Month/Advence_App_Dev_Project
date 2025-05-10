package com.example.controllers.admin;

import com.example.models.Review;
import com.example.repositories.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {
    private final ReviewRepository reviewRepository;

    public AdminReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @PutMapping("/{productId}/approve")
    public Review approveReview(@PathVariable Long productId, @RequestParam int userId, @RequestParam boolean approved) {
        Review.ReviewId reviewId = new Review.ReviewId();
        reviewId.setProductId(productId);
        reviewId.setUserId(userId);
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        // You can add an 'approved' field to Review entity if you want to track approval status
        // review.setApproved(approved);
        // return reviewRepository.save(review);
        // For now, just return the review as a placeholder
        return review;
    }

    @DeleteMapping("/{productId}")
    public void deleteReview(@PathVariable Long productId, @RequestParam int userId) {
        Review.ReviewId reviewId = new Review.ReviewId();
        reviewId.setProductId(productId);
        reviewId.setUserId(userId);
        reviewRepository.deleteById(reviewId);
    }
} 