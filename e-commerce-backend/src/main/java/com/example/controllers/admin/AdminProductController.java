package com.example.controllers.admin;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.services.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> approveProduct(@PathVariable Long id, @RequestParam boolean approved) {
        // Implementation for approving/rejecting a product
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/featured")
    public ResponseEntity<?> setFeatured(@PathVariable Long id, @RequestParam boolean featured) {
        // Implementation for setting a product as featured/not featured
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> setStatus(@PathVariable Long id, @RequestParam String status) {
        // Implementation for changing product status (active, inactive, etc.)
        return ResponseEntity.ok().build();
    }
} 