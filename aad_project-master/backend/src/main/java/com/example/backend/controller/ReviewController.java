package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ReviewDTO;
import com.example.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getProductReviews(@PathVariable Long productId) {
        List<ReviewDTO> reviews = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getUserReviews(Authentication auth) {
        List<ReviewDTO> reviews = reviewService.getUserReviews(auth);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDTO>> createReview(@RequestBody ReviewDTO reviewDTO, Authentication auth) {
        ReviewDTO createdReview = reviewService.createReview(reviewDTO, auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdReview));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewDTO>> updateReview(@PathVariable Long id, @RequestBody ReviewDTO reviewDTO, Authentication auth) {
        ReviewDTO updatedReview = reviewService.updateReview(id, reviewDTO, auth);
        return ResponseEntity.ok(ApiResponse.success(updatedReview));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id, Authentication auth) {
        reviewService.deleteReview(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
} 