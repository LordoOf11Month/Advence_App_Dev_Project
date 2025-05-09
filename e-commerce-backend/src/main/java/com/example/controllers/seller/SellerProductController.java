package com.example.controllers.seller;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products")
@PreAuthorize("hasRole('SELLER')")
public class SellerProductController extends GenericController<Product, ProductResponse, CreateProductRequest, Long> {
    
    private final ProductService productService;
    
    public SellerProductController(ProductService productService) {
        super(productService);
        this.productService = productService;
    }
    
    @GetMapping
    @Override
    public ResponseEntity<Page<ProductResponse>> getAll(Pageable pageable) {
        // Override to only return products for the current seller
        return super.getAll(pageable);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getProductStats() {
        // Implementation for getting product statistics
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<?>> getLowStockProducts() {
        // Implementation for getting low stock products
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        // Implementation for updating product stock
        return ResponseEntity.ok().build();
    }
} 