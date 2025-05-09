package com.example.controllers.user;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.services.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/products")
@PreAuthorize("isAuthenticated()")
public class UserProductController extends GenericController<Product, ProductResponse, CreateProductRequest, Long> {
    
    private final ProductService productService;
    
    public UserProductController(ProductService productService) {
        super(productService);
        this.productService = productService;
    }
    
    @PostMapping("/{id}/favorite")
    public ResponseEntity<Void> addToFavorites(@PathVariable Long id) {
        // Implementation for adding product to favorites
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}/favorite")
    public ResponseEntity<Void> removeFromFavorites(@PathVariable Long id) {
        // Implementation for removing product from favorites
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites() {
        // Implementation for getting user's favorite products
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/review")
    public ResponseEntity<Void> addReview(@PathVariable Long id, @RequestBody String review) {
        // Implementation for adding a product review
        return ResponseEntity.ok().build();
    }
} 