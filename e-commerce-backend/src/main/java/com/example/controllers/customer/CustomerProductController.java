package com.example.controllers.customer;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.models.Product;
import com.example.models.Review;
import com.example.models.User;
import com.example.repositories.ProductRepository;
import com.example.repositories.ReviewRepository;
import com.example.repositories.UserRepository;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.services.ProductService;

@RestController
@RequestMapping("/api/customer/products")
@PreAuthorize("isAuthenticated()")
public class CustomerProductController {
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    public CustomerProductController(ProductRepository productRepository, ReviewRepository reviewRepository, UserRepository userRepository, ProductService productService) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productService = productService;
    }

    // Endpoint to get products by category slug
    @GetMapping("/category/{slug}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategorySlug(@PathVariable String slug) {
        List<ProductResponse> products = productService.findByCategorySlug(slug);
        if (products.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(products);
    }

    // Favorites management
    @GetMapping("/favorites")
    public ResponseEntity<List<Product>> getFavoriteProducts() {
        User currentUser = getCurrentUser();
        if (currentUser.getFavoriteProducts() == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }
        return ResponseEntity.ok(currentUser.getFavoriteProducts());
    }

    @PostMapping("/favorites/{id}")
    public ResponseEntity<Void> addToFavorites(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        
        if (currentUser.getFavoriteProducts() == null) {
            currentUser.setFavoriteProducts(new ArrayList<>());
        }
        
        // Check if product is already in favorites to avoid duplicates
        if (!currentUser.getFavoriteProducts().contains(product)) {
            currentUser.getFavoriteProducts().add(product);
            userRepository.save(currentUser);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/favorites/{id}")
    public ResponseEntity<Void> removeFromFavorites(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        
        if (currentUser.getFavoriteProducts() != null) {
            currentUser.getFavoriteProducts().removeIf(p -> p.getId().equals(product.getId()));
            userRepository.save(currentUser);
        }
        
        return ResponseEntity.noContent().build();
    }

    // Review endpoints
    @GetMapping("/{id}/reviews")
    public Map<String, Object> getProductReviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "recent") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int limit) {
        
        List<Review> reviews = reviewRepository.findByProductId(id);
        
        // Sort reviews based on the requested criteria
        if ("recent".equals(sort)) {
            reviews.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        } else if ("highest".equals(sort)) {
            reviews.sort((a, b) -> Integer.compare(b.getRating(), a.getRating()));
        } else if ("lowest".equals(sort)) {
            reviews.sort((a, b) -> Integer.compare(a.getRating(), b.getRating()));
        } else if ("helpful".equals(sort)) {
            // For now, sort by rating since we don't track helpfulness yet
            reviews.sort((a, b) -> Integer.compare(b.getRating(), a.getRating()));
        }
        
        // Calculate pagination
        int startIndex = (page - 1) * limit;
        int endIndex = Math.min(startIndex + limit, reviews.size());
        List<Review> paginatedReviews = startIndex < endIndex 
            ? reviews.subList(startIndex, endIndex) 
            : Collections.emptyList();
        
        Map<String, Object> response = new HashMap<>();
        response.put("reviews", paginatedReviews);
        response.put("total", reviews.size());
        
        return response;
    }

    @GetMapping("/{id}/review-stats")
    public Map<String, Object> getProductReviewStats(@PathVariable Long id) {
        List<Review> reviews = reviewRepository.findByProductId(id);
        
        // Calculate average rating
        double averageRating = reviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);
        
        // Count ratings by star
        Map<Integer, Long> ratingCounts = reviews.stream()
            .collect(Collectors.groupingBy(Review::getRating, Collectors.counting()));
        
        // Ensure all rating levels are represented in the map
        for (int i = 1; i <= 5; i++) {
            ratingCounts.putIfAbsent(i, 0L);
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", averageRating);
        stats.put("totalReviews", reviews.size());
        stats.put("ratingCounts", ratingCounts);
        
        return stats;
    }

    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }
}