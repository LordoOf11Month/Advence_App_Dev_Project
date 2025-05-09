package com.example.controllers.seller;

import com.example.controllers.generic.GenericController;
import com.example.DTO.ProductDTO.ProductResponse;
import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.models.Product;
import com.example.models.Store;
import com.example.models.User;
import com.example.repositories.UserRepository;
import com.example.security.CustomUserDetails;
import com.example.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/api/seller/products")
@PreAuthorize("hasRole('SELLER')")
public class SellerProductController {
    
    private final ProductService productService;
    private final UserRepository userRepository;
    
    @Autowired
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
        // TODO: Implement productService.getProductStatsForStore(storeId);
        return ResponseEntity.ok("Stats for store " + storeId + " - to be implemented");
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<?>> getLowStockProducts() {
        Long storeId = getCurrentSellerStoreId();
        // TODO: Implement productService.getLowStockProductsForStore(storeId);
        // return ResponseEntity.ok("Low stock products for store " + storeId + " - to be implemented");
        return ResponseEntity.ok(java.util.Collections.emptyList()); // Return empty list for now
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        Long storeId = getCurrentSellerStoreId();
        // TODO: Implement productService.updateStockForStoreProduct(id, quantity, storeId);
        // This needs to verify product 'id' belongs to 'storeId'.
        return ResponseEntity.ok("Stock updated for product " + id + " in store " + storeId + " - to be implemented");
    }
} 