package com.example.controllers.Public;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.ProductDTO.ProductFilterRequest;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.services.ProductService;
import com.example.models.Product;
import com.example.models.Category;

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
        System.out.println("Fetching product with ID: " + id);
        return productService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Fetch all products in the same category as a specific product ID.
     * This ensures all products show up in relevant categories.
     */
    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductResponse>> getRelatedProducts(@PathVariable Long id) {
        System.out.println("Fetching related products for product ID: " + id);
        return ResponseEntity.ok(productService.findRelatedProductsById(id));
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

    /**
     * Fetch products by category ID.
     */
    @GetMapping("/category/id/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getByCategory(@PathVariable Integer categoryId) {
        System.out.println("Fetching products for category ID: " + categoryId);
        List<ProductResponse> products = productService.findByCategoryId(categoryId);
        System.out.println("Found " + products.size() + " products for category ID: " + categoryId);
        return ResponseEntity.ok(products);
    }

    /**
     * Fetch products by category slug.
     */
    @GetMapping("/category/{slug}")
    public ResponseEntity<List<ProductResponse>> getByCategorySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.findByCategorySlug(slug));
    }

    /**
     * Search products by name or description.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> search(@RequestParam(required = false) String search, 
                                                      @RequestParam(required = false) String keyword) {
        String query = search != null ? search : keyword;
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(productService.searchByKeyword(query));
    }

    /**
     * Search products by both category and keyword.
     * This endpoint allows searching for products within a specific category and its subcategories.
     */
    @GetMapping("/category/{slug}/search")
    public ResponseEntity<List<ProductResponse>> searchInCategory(
            @PathVariable String slug,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(productService.searchByCategoryAndKeyword(slug, keyword));
    }

    /**
     * Get category information for a specific product.
     * This endpoint returns the category URL information for product-to-category navigation.
     */
    @GetMapping("/{id}/category-url")
    public ResponseEntity<Map<String, String>> getProductCategoryUrl(@PathVariable Long id) {
        ProductResponse product = productService.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, String> response = new HashMap<>();
        
        if (product.getCategorySlug() == null || product.getCategorySlug().isEmpty()) {
            response.put("url", "/category/all");
            response.put("slug", "all");
            response.put("name", "All Products");
        } else {
            response.put("url", "/category/" + product.getCategorySlug());
            response.put("slug", product.getCategorySlug());
            response.put("name", product.getCategoryName());
        }
        
        return ResponseEntity.ok(response);
    }

    // According to the template, PublicProductController could also have:
    // - GET /category/{categoryId} - Kategoriye göre ürünleri getir
    // - GET /search - Arama kriterleriyle ürün ara (browseProducts might cover this)
    // These would require corresponding methods in ProductService.
}