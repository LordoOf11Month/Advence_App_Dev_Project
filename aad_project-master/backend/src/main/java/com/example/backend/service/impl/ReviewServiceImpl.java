package com.example.backend.service.impl;

import com.example.backend.dto.ReviewDTO;
import com.example.backend.entity.Order;
import com.example.backend.entity.Product;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import org.springframework.security.access.AccessDeniedException;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @Override
    public List<ReviewDTO> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        return reviewRepository.findByProduct(product)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewDTO> getUserReviews(Authentication auth) {
        User user = (User) auth.getPrincipal();
        
        return reviewRepository.findByUser(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewDTO createReview(ReviewDTO reviewDTO, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Product product = productRepository.findById(reviewDTO.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + reviewDTO.getProductId()));
        
        // Check if user has purchased the product and it's been delivered
        boolean hasDeliveredOrder = orderRepository.findByUserOrderByOrderDateDesc(user).stream()
                .filter(order -> "DELIVERED".equals(order.getShipmentStatus()))
                .anyMatch(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getId().equals(product.getId())));
        
        if (!hasDeliveredOrder) {
            throw new BadRequestException("You can only review products that have been delivered to you");
        }
        
        // Check if user has already reviewed the product
        if (reviewRepository.findByProductAndUser(product, user).isPresent()) {
            throw new BadRequestException("You have already reviewed this product");
        }
        
        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        
        review = reviewRepository.save(review);
        
        return mapToDTO(review);
    }

    @Override
    @Transactional
    public ReviewDTO updateReview(Long id, ReviewDTO reviewDTO, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        
        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("You do not have permission to update this review");
        }
        
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        
        review = reviewRepository.save(review);
        
        return mapToDTO(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        
        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("You do not have permission to delete this review");
        }
        
        reviewRepository.delete(review);
    }
    
    private ReviewDTO mapToDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setProductId(review.getProduct().getId());
        dto.setProductName(review.getProduct().getName());
        dto.setUserId(review.getUser().getId());
        dto.setUserName(review.getUser().getName() + " " + review.getUser().getSurname());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
} 