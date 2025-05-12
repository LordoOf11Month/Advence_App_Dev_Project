package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.ProductDTO;
import com.example.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getAllProducts() {
        List<ProductDTO> products = productService.findAll();
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> getProduct(@PathVariable Long id) {
        ProductDTO productDTO = productService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(productDTO));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(@RequestParam String keyword) {
        List<ProductDTO> products = productService.search(keyword);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductDTO> products = productService.findByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @GetMapping("/store/{storeId}")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsByStore(@PathVariable Long storeId) {
        List<ProductDTO> products = productService.findByStore(storeId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @RequestBody ProductDTO productDTO,
            Authentication authentication) {
        ProductDTO createdProduct = productService.createSellerProduct(productDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", createdProduct));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO productDTO,
            Authentication authentication) {
        ProductDTO updatedProduct = productService.updateSellerProduct(id, productDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updatedProduct));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<?>> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        productService.deleteSellerProduct(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
    
    @PostMapping("/compare")
    public ResponseEntity<ApiResponse<Map<String, Object>>> compareProducts(@RequestBody List<Long> productIds) {
        Map<String, Object> comparisonResult = productService.compareProducts(productIds);
        return ResponseEntity.ok(ApiResponse.success("Products compared successfully", comparisonResult));
    }
} 