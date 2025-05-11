package com.example.controllers.customer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.models.Review;
import com.example.models.User;
import com.example.repositories.OrderRepository;
import com.example.repositories.ProductRepository;
import com.example.repositories.ReviewRepository;
import com.example.repositories.UserRepository;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@RestController
@RequestMapping("/api/reviews")
public class CustomerReviewController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // Data Transfer Object for creating a review
    @Data
    public static class ReviewRequest {
        @NotNull
        private Long productId;
        
        @NotNull
        @Min(1) @Max(5)
        private Integer rating;
        
        private String comment;
    }
    
    // DTO for response to avoid proxy serialization issues
    @Data
    public static class ReviewResponse {
        private Long id;
        private Long productId;
        private int userId;
        private int rating;
        private String comment;
        private String userName;
        private boolean verifiedPurchase;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;
        
        public ReviewResponse(Review review) {
            this.id = review.getId();
            this.productId = review.getProduct().getId();
            this.userId = review.getUser().getId();
            this.rating = review.getRating();
            this.comment = review.getComment();
            // Access only the required fields to avoid lazy loading issues
            this.userName = review.getUser() != null ? review.getUser().getFirstName() + " " + (review.getUser().getLastName() != null ? review.getUser().getLastName() : "") : "Anonymous";
            this.verifiedPurchase = review.isVerifiedPurchase();
            this.createdAt = review.getCreatedAt();
            this.updatedAt = review.getUpdatedAt();
        }
    }

    public CustomerReviewController(ReviewRepository reviewRepository, UserRepository userRepository, OrderRepository orderRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }
    
    @GetMapping("/product/{productId}")
    public Map<String, Object> getReviewsByProductId(
            @PathVariable Long productId, 
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit) {
        
        // First check if product exists
        productRepository.findById(productId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found")
        );
        
        List<Review> reviews;
        // Apply sorting
        if ("highest".equals(sort)) {
            reviews = reviewRepository.findByProductIdOrderByRatingDesc(productId);
        } else if ("lowest".equals(sort)) {
            reviews = reviewRepository.findByProductIdOrderByRatingAsc(productId);
        } else {
            // Default is "recent"
            reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        }
        
        // Calculate pagination
        int total = reviews.size();
        int startIndex = (page - 1) * limit;
        int endIndex = Math.min(startIndex + limit, total);
        
        // Apply pagination (if valid indices)
        List<ReviewResponse> paginatedReviews = 
            startIndex < total ? 
            reviews.subList(startIndex, endIndex).stream()
                   .map(ReviewResponse::new)
                   .collect(Collectors.toList()) :
            List.of();
        
        Map<String, Object> response = new HashMap<>();
        response.put("reviews", paginatedReviews);
        response.put("total", total);
        response.put("page", page);
        response.put("limit", limit);
        
        return response;
    }

    @PostMapping
    public ReviewResponse addReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Long productId = reviewRequest.getProductId();
        
        // Check if product exists
        var product = productRepository.findById(productId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found")
        );
        
        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(productId, user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "You have already reviewed this product. Please use the update endpoint.");
        }
        
        // Create a new Review instance
        Review review = new Review();
        
        // Check if user purchased the product, but don't restrict - just mark as verified
        boolean hasPurchased = orderRepository.existsByUserIdAndProductId(user.getId(), productId);
        review.setVerifiedPurchase(hasPurchased);
        
        // Set the review details
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        
        // Set references
        review.setUser(user);
        review.setProduct(product);
        
        // Save the review and convert to DTO before returning
        Review savedReview = reviewRepository.save(review);
        return new ReviewResponse(savedReview);
    }

    @PutMapping("/{productId}")
    public ReviewResponse updateReview(@PathVariable Long productId, @Valid @RequestBody ReviewRequest reviewRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        // Find existing review
        Review review = reviewRepository.findByProductIdAndUserId(productId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        
        // Update review fields
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        
        Review savedReview = reviewRepository.save(review);
        return new ReviewResponse(savedReview);
    }

    @DeleteMapping("/{productId}")
    public Map<String, Boolean> deleteReview(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        // Find existing review
        Review review = reviewRepository.findByProductIdAndUserId(productId, user.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        
        reviewRepository.delete(review);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", true);
        return response;
    }
} 