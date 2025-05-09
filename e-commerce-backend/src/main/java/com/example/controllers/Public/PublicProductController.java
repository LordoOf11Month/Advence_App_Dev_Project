package com.example.controllers.Public;

import com.example.services.ProductService;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.ProductFilterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/public/products")
public class PublicProductController {

    private final ProductService productService;

    public PublicProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Endpoint to browse products with filters.
     * Supports dynamic filtering for search, pricing, and categories.
     * Mapped from original ProductController GET /api/products
     */
    @GetMapping
    public Page<ProductResponse> browseProducts(ProductFilterRequest filter, Pageable pageable) {
        return productService.browseProducts(filter, pageable);
    }

    /**
     * Fetch all products without any filters.
     * Mapped from original ProductController GET /api/products/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<ProductResponse>> getAll() {
        return ResponseEntity.ok(productService.listAllProducts());
    }

    /**
     * Fetch a product by its ID.
     * Mapped from original ProductController GET /api/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return productService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Fetch all products associated with a specific store.
     * Filtered based on the store ID passed via the path variable.
     * Mapped from original ProductController GET /api/products/stores/{storeId}
     */
    @GetMapping("/stores/{storeId}")
    public ResponseEntity<List<ProductResponse>> getByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(productService.findByStore(storeId));
    }

    // According to the template, PublicProductController could also have:
    // - GET /category/{categoryId} - Kategoriye göre ürünleri getir
    // - GET /search - Arama kriterleriyle ürün ara (browseProducts might cover this)
    // These would require corresponding methods in ProductService.
} 