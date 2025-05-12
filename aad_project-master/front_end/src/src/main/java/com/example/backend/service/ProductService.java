package com.example.backend.service;

import com.example.backend.dto.ProductDTO;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface ProductService {
    // Public operations
    List<ProductDTO> findAll();
    ProductDTO findById(Long id);
    List<ProductDTO> findByCategory(Long categoryId);
    List<ProductDTO> findByStore(Long storeId);
    List<ProductDTO> search(String keyword);
    Map<String, Object> compareProducts(List<Long> productIds);
    
    // Seller operations
    List<ProductDTO> findSellerProducts(Authentication authentication);
    ProductDTO createSellerProduct(ProductDTO productDTO, Authentication authentication);
    ProductDTO updateSellerProduct(Long id, ProductDTO productDTO, Authentication authentication);
    void deleteSellerProduct(Long id, Authentication authentication);
    
    // Generic operations (used by admin)
    ProductDTO create(ProductDTO productDTO);
    ProductDTO update(Long id, ProductDTO productDTO);
    void delete(Long id);

    List<ProductDTO> searchProducts(String keyword);
    ProductDTO validateAndGetProductDTO(Long id);
    List<ProductDTO> findProductsByStore(Long storeId);
    
    List<Map<String, Object>> getAllReviews();
    void deleteReview(Long id);
} 