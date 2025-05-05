package com.example.controllers;

import com.example.models.Product;
import com.example.services.ProductService;
import com.example.DTO.ProductDTO.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
    public Page<Product> browseProducts(ProductFilterRequest filter, Pageable pageable) {
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
        return ResponseEntity.ok(productService.findById(id));
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
        return ResponseEntity.ok(productService.create(dto));
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
}