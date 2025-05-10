package com.example.controllers.customer;

import com.example.models.Review;
import com.example.models.User;
import com.example.repositories.ReviewRepository;
import com.example.repositories.UserRepository;
import com.example.repositories.OrderRepository;
import com.example.repositories.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class CustomerReviewController {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public CustomerReviewController(ReviewRepository reviewRepository, UserRepository userRepository, OrderRepository orderRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public Review addReview(@Valid @RequestBody Review review) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Long productId = review.getId().getProductId();
        // Check if user purchased the product
        boolean hasPurchased = orderRepository.existsByUserIdAndProductId(user.getId(), productId);
        if (!hasPurchased) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review products you have purchased.");
        }
        review.setUser(user);
        review.setProduct(productRepository.findById(productId).orElseThrow());
        review.getId().setUserId(user.getId());
        return reviewRepository.save(review);
    }

    @PutMapping("/{productId}")
    public Review updateReview(@PathVariable Long productId, @Valid @RequestBody Review updatedReview) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Review.ReviewId reviewId = new Review.ReviewId();
        reviewId.setProductId(productId);
        reviewId.setUserId(user.getId());
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        review.setRating(updatedReview.getRating());
        review.setComment(updatedReview.getComment());
        return reviewRepository.save(review);
    }

    @DeleteMapping("/{productId}")
    public void deleteReview(@PathVariable Long productId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        Review.ReviewId reviewId = new Review.ReviewId();
        reviewId.setProductId(productId);
        reviewId.setUserId(user.getId());
        reviewRepository.deleteById(reviewId);
    }
} 