package com.example.controllers.admin;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.services.ProductService;
import org.springframework.http.HttpStatus;
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

    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(@RequestBody CreateProductRequest createProductRequest) {
        ProductResponse productResponse = productService.save(createProductRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(productResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
} 