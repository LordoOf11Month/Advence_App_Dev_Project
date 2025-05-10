package com.example.controllers.admin;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.services.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
} 