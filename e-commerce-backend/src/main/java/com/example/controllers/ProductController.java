package com.example.controllers;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.DTO.ProductDTO.ProductFilterRequest;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.services.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Endpoint to browse products with filters.
     * Supports dynamic filtering for search, pricing, and categories.
     */
    @GetMapping
    public Page<ProductResponse> browseProducts(ProductFilterRequest filter, Pageable pageable) {
        // Delegates to ProductService for dynamic filtering & pagination
        return productService.browseProducts(filter, pageable);
    }

    /**
     * Fetch all products without any filters.
     */
    @GetMapping("/all")
    public ResponseEntity<List<ProductResponse>> getAll() {
        // Fetches all products and returns as ProductResponse DTO
        return ResponseEntity.ok(productService.listAllProducts());
    }

    /**
     * Fetch a product by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        // Fetches a product by its unique ID
        return productService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Fetch all products associated with a specific store.
     * Filtered based on the store ID passed via the path variable.
     */
    @GetMapping("/stores/{storeId}")
    public ResponseEntity<List<ProductResponse>> getByStore(@PathVariable Long storeId) {
        // Fetch products based on the store ID
        return ResponseEntity.ok(productService.findByStore(storeId));
    }

    /**
     * Create a new product.
     * Accepts a ProductCreateRequest payload, and validates it.
     */
    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest dto) {
        // Create a new product and return the created ProductResponse
        return ResponseEntity.ok(productService.save(dto));
    }

    /**
     * Update an existing product.
     * Requires the product ID via the path variable and the updated data via the request body.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody CreateProductRequest dto) {
        // Update the product with the specified ID
        return ResponseEntity.ok(productService.update(id, dto));
    }

    /**
     * Delete a product by its ID.
     * Accepts the product ID via the path variable.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Deletes a product based on its unique ID
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Update a product's image.
     * This endpoint simplifies image updating by accepting a single image URL
     * and preserving query parameters in the URL.
     */
    @PostMapping("/{id}/image")
    public ResponseEntity<Object> updateProductImage(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String imageUrl = request.get("imageUrl");
        
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "Image URL cannot be null or empty",
                    "timestamp", System.currentTimeMillis()
                ));
        }
        
        // Log the image URL for debugging
        System.out.println("Image update request for product " + id + " with URL: " + imageUrl);
        System.out.println("Is Discord CDN URL: " + (imageUrl.contains("discordapp.net") || imageUrl.contains("discord.com")));
        
        try {
            // Use the existing method but wrap the single URL in a list
            ProductResponse response = productService.updateProductImages(id, Collections.singletonList(imageUrl));
            
            // Return the EXACT image URL that was sent in the request, not what's in the DB
            // This ensures we don't return stale data
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("id", id);
            successResponse.put("imageUrl", imageUrl); // Use the input URL, not response.getImages().get(0)
            successResponse.put("success", true);
            successResponse.put("timestamp", System.currentTimeMillis());
            
            System.out.println("Image successfully updated - Input URL: " + imageUrl);
            
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            System.out.println("Error updating product image: " + e.getMessage());
            e.printStackTrace();
            
            // Return detailed error info
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update product image");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
        }
    }
} 