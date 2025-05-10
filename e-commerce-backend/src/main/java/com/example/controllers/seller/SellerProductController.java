package com.example.controllers.seller;

import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Store;
import com.example.models.User;
import com.example.repositories.UserRepository;
import com.example.security.CustomUserDetails;
import com.example.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller/products")
@PreAuthorize("hasRole('SELLER')")
public class SellerProductController {
    
    private final ProductService productService;
    private final UserRepository userRepository;
    

    public SellerProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    private Long getCurrentSellerStoreId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated or details not found");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User currentUser = userDetails.getUser();

        if (currentUser == null || currentUser.getRole() != User.Role.seller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a seller.");
        }

        List<Store> sellerStores = currentUser.getStores();
        if (sellerStores == null || sellerStores.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seller has no associated store.");
        }
        return sellerStores.get(0).getId();
    }
    
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllSellerProducts(Pageable pageable) {
        Long storeId = getCurrentSellerStoreId();
        return ResponseEntity.ok(productService.findAllByStoreId(storeId, pageable));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        Long storeId = getCurrentSellerStoreId();
        ProductResponse product = productService.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        
        return ResponseEntity.ok(productService.findByIdAndStoreId(id, storeId)
             .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found in your store or does not exist")));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest dto) {
        Long storeId = getCurrentSellerStoreId();
        try {
            ProductResponse createdProduct = productService.saveForSeller(dto, storeId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (AccessDeniedException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
        @PathVariable Long id,
        @Valid @RequestBody CreateProductRequest dto) {
        Long storeId = getCurrentSellerStoreId();
        try {
            ProductResponse updatedProduct = productService.updateForSeller(id, dto, storeId);
            return ResponseEntity.ok(updatedProduct);
        } catch (AccessDeniedException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        Long storeId = getCurrentSellerStoreId();
        try {
            productService.deleteForSeller(id, storeId);
            return ResponseEntity.noContent().build();
        } catch (AccessDeniedException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getProductStats() {
        Long storeId = getCurrentSellerStoreId();
        try {
            // Get total products
            long totalProducts = productService.findAllByStoreId(storeId, Pageable.unpaged()).getTotalElements();
            
            // Get low stock products (less than 10 items)
            List<ProductResponse> lowStockProducts = productService.findAllByStoreId(storeId, Pageable.unpaged())
                .getContent()
                .stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 10)
                .collect(Collectors.toList());
            
            // Create stats response
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProducts", totalProducts);
            stats.put("lowStockProducts", lowStockProducts.size());
            stats.put("lowStockProductsList", lowStockProducts);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching product statistics: " + e.getMessage());
        }
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        Long storeId = getCurrentSellerStoreId();
        try {
            List<ProductResponse> lowStockProducts = productService.findAllByStoreId(storeId, Pageable.unpaged())
                .getContent()
                .stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 10)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(lowStockProducts);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error fetching low stock products: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        Long storeId = getCurrentSellerStoreId();
        try {
            // Verify product belongs to store
            ProductResponse product = productService.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found in your store"));
            
            // Create update request with new stock quantity
            CreateProductRequest updateRequest = new CreateProductRequest();
            updateRequest.setTitle(product.getTitle());
            updateRequest.setDescription(product.getDescription());
            updateRequest.setPrice(product.getPrice());
            updateRequest.setCategory(product.getCategory());
            updateRequest.setStockQuantity(quantity);
            updateRequest.setImageUrls(product.getImages());
            
            // Update product
            ProductResponse updatedProduct = productService.updateForSeller(id, updateRequest, storeId);
            return ResponseEntity.ok(updatedProduct);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating stock: " + e.getMessage());
        }
    }
} 