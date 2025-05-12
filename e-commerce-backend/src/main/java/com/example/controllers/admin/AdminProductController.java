package com.example.controllers.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.controllers.generic.GenericController;
import com.example.models.Product;
import com.example.services.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController extends GenericController<Product, ProductResponse, CreateProductRequest, Long> {
    
    private final ProductService productService;
    
    public AdminProductController(ProductService productService) {
        super(productService);
        this.productService = productService;
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ProductResponse> approveProduct(@PathVariable Long id, @RequestParam boolean approved) {
        return ResponseEntity.ok(productService.approveProduct(id, approved));
    }

    @PutMapping("/{id}/free-shipping")
    public ResponseEntity<ProductResponse> toggleFreeShipping(@PathVariable Long id, @RequestParam boolean freeShipping) {
        return ResponseEntity.ok(productService.toggleFreeShipping(id, freeShipping));
    }

    @PutMapping("/{id}/fast-delivery")
    public ResponseEntity<ProductResponse> toggleFastDelivery(@PathVariable Long id, @RequestParam boolean fastDelivery) {
        return ResponseEntity.ok(productService.toggleFastDelivery(id, fastDelivery));
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<Object> updateProductImage(
            @PathVariable Long id,
            @RequestBody Map<String, List<String>> updateRequest) {
        
        List<String> imageUrls = updateRequest.get("imageUrls");
        
        // Log the complete request for debugging
        System.out.println("Image update request for product " + id + ": " + updateRequest);
        
        if (imageUrls == null) {
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "Image URLs list cannot be null", 
                    "timestamp", System.currentTimeMillis()
                ));
        }
        
        // Filter out null, "null", "undefined" and empty values
        List<String> validImageUrls = imageUrls.stream()
                .filter(url -> url != null && !url.trim().isEmpty() && !url.equals("null") && !url.equals("undefined"))
                .collect(Collectors.toList());
                
        // Log the filtered list
        System.out.println("Filtered valid image URLs: " + validImageUrls);
        
        try {
            ProductResponse response = productService.updateProductImages(id, validImageUrls);
            
            // Return success response with timestamp for cache busting
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("product", response);
            successResponse.put("success", true);
            successResponse.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            System.out.println("Error updating product images: " + e.getMessage());
            e.printStackTrace();
            
            // Return detailed error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update product images");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
        }
    }

    @Override
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @RequestMapping(value = "/{id}/verify-images", method = RequestMethod.GET)
    public ResponseEntity<Map<String, Object>> verifyProductImages(@PathVariable Long id) {
        try {
            Optional<ProductResponse> productOpt = productService.findById(id);
            
            if (productOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Product not found with ID: " + id));
            }
            
            ProductResponse product = productOpt.get();
            
            // Create a response with detailed image information
            Map<String, Object> response = new HashMap<>();
            response.put("productId", id);
            response.put("productName", product.getTitle());
            
            // Handle images with null check
            List<String> images = product.getImages();
            response.put("hasImages", images != null && !images.isEmpty());
            response.put("imageCount", images != null ? images.size() : 0);
            response.put("images", images);
            
            // Add a timestamp for cache busting in the frontend
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to verify product images: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody CreateProductRequest dto) {
        // Add extra logging for debugging
        try {
            System.out.println("Admin creating product: " + dto.getTitle());
            if (dto.getImageUrls() != null) {
                System.out.println("Image URLs: " + String.join(", ", dto.getImageUrls()));
            }
            
            // Use the specialized method for admin product creation
            ProductResponse created = productService.saveWithDefaultStore(dto, 1L);
            System.out.println("Product created successfully with id: " + created.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            System.out.println("Error creating product: " + e.getMessage());
            e.printStackTrace();
            
            // Build a detailed error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create product");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            if (e.getCause() != null) {
                errorResponse.put("cause", e.getCause().getMessage());
            }
            
            // Return a 500 with detailed error info
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null); // The error details will be in the response body
        }
    }
} 