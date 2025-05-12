package com.example.controllers.admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.controllers.customer.CustomerReviewController.ReviewResponse;
import com.example.models.Review;
import com.example.repositories.ReviewRepository;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {
    private final ReviewRepository reviewRepository;

    public AdminReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
            .map(ReviewResponse::new)
            .collect(Collectors.toList());
    }

    @PutMapping("/{reviewId}/approve")
    public ReviewResponse approveReview(@PathVariable Long reviewId, @RequestParam boolean approved) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        
        // Add an approved field to the Review entity if not already present
        // review.setApproved(approved);
        
        return new ReviewResponse(reviewRepository.save(review));
    }

    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found");
        }
        reviewRepository.deleteById(reviewId);
    }
} 