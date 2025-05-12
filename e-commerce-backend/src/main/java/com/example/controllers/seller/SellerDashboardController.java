package com.example.controllers.seller;

import com.example.DTO.BulkInventoryUpdateDTO;
import com.example.DTO.PromotionDTO;
import com.example.DTO.SellerOrderDTO;
import com.example.DTO.SellerOrderStatsDTO;
import com.example.DTO.SellerProductDTO;
import com.example.DTO.SellerProfileDTO;
import com.example.DTO.SellerRatingAnalyticsDTO;
import com.example.DTO.SellerRevenueDTO;
import com.example.DTO.SellerReviewDTO;
import com.example.DTO.SellerSalesReportDTO;
import com.example.DTO.SellerStatsDTO;
import com.example.DTO.SellerStoreSettingsDTO;
import com.example.services.OrderService;
import com.example.services.ProductService;
import com.example.services.StoreSellerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerDashboardController {

    private final StoreSellerService storeSellerService;
    private final ProductService productService;
    private final OrderService orderService;

    // Dashboard Statistics
    @GetMapping("/{sellerId}/stats")
    public ResponseEntity<SellerStatsDTO> getSellerStats(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerStats(sellerId));
    }

    @GetMapping("/{sellerId}/order-stats")
    public ResponseEntity<SellerOrderStatsDTO> getSellerOrderStats(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerOrderStats(sellerId));
    }

    // Product Management
    @GetMapping("/{sellerId}/products")
    public ResponseEntity<List<SellerProductDTO>> getSellerProducts(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerProducts(sellerId));
    }

    @GetMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<SellerProductDTO> getSellerProduct(
            @PathVariable String sellerId, 
            @PathVariable String productId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerProduct(sellerId, productId));
    }

    @PostMapping("/{sellerId}/products")
    public ResponseEntity<SellerProductDTO> createSellerProduct(
            @PathVariable String sellerId, 
            @Valid @RequestBody SellerProductDTO product, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return new ResponseEntity<>(storeSellerService.createSellerProduct(sellerId, product), HttpStatus.CREATED);
    }

    @PutMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<SellerProductDTO> updateSellerProduct(
            @PathVariable String sellerId, 
            @PathVariable String productId, 
            @Valid @RequestBody SellerProductDTO product, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.updateSellerProduct(sellerId, productId, product));
    }

    @DeleteMapping("/{sellerId}/products/{productId}")
    public ResponseEntity<Void> deleteSellerProduct(
            @PathVariable String sellerId, 
            @PathVariable String productId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        storeSellerService.deleteSellerProduct(sellerId, productId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{sellerId}/products/{productId}/image")
    public ResponseEntity<SellerProductDTO> updateProductImage(
            @PathVariable String sellerId, 
            @PathVariable String productId, 
            @RequestBody Map<String, String> request, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        String imageUrl = request.get("imageUrl");
        if (imageUrl == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(storeSellerService.updateProductImage(sellerId, productId, imageUrl));
    }

    // Order Management
    @GetMapping("/{sellerId}/orders")
    public ResponseEntity<List<SellerOrderDTO>> getSellerOrders(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerOrders(sellerId));
    }

    @GetMapping("/{sellerId}/orders/{orderId}")
    public ResponseEntity<SellerOrderDTO> getSellerOrder(
            @PathVariable String sellerId, 
            @PathVariable String orderId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerOrder(sellerId, orderId));
    }

    @PutMapping("/{sellerId}/orders/{orderId}/status")
    public ResponseEntity<SellerOrderDTO> updateSellerOrderStatus(
            @PathVariable String sellerId, 
            @PathVariable String orderId, 
            @RequestBody Map<String, String> request, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        String status = request.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(storeSellerService.updateSellerOrderStatus(sellerId, orderId, status));
    }

    // Inventory Management
    @PutMapping("/{sellerId}/inventory/{productId}")
    public ResponseEntity<SellerProductDTO> updateInventory(
            @PathVariable String sellerId, 
            @PathVariable String productId, 
            @RequestBody Map<String, Integer> request, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        Integer quantity = request.get("quantity");
        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(storeSellerService.updateInventory(sellerId, productId, quantity));
    }

    @PutMapping("/{sellerId}/inventory/bulk")
    public ResponseEntity<List<SellerProductDTO>> bulkUpdateInventory(
            @PathVariable String sellerId, 
            @RequestBody BulkInventoryUpdateDTO request,
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.bulkUpdateInventory(sellerId, request.getUpdates()));
    }

    // Sales and Revenue
    @GetMapping("/{sellerId}/revenue")
    public ResponseEntity<SellerRevenueDTO> getSellerRevenue(
            @PathVariable String sellerId, 
            @RequestParam String period, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerRevenue(sellerId, period));
    }

    @GetMapping("/{sellerId}/sales-report")
    public ResponseEntity<SellerSalesReportDTO> getSellerSalesReport(
            @PathVariable String sellerId, 
            @RequestParam String startDate, 
            @RequestParam String endDate, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerSalesReport(sellerId, startDate, endDate));
    }

    // Promotions and Discounts
    @GetMapping("/{sellerId}/promotions")
    public ResponseEntity<List<PromotionDTO>> getSellerPromotions(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerPromotions(sellerId));
    }

    @PostMapping("/{sellerId}/promotions")
    public ResponseEntity<PromotionDTO> createSellerPromotion(
            @PathVariable String sellerId, 
            @Valid @RequestBody PromotionDTO promotion, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return new ResponseEntity<>(storeSellerService.createSellerPromotion(sellerId, promotion), HttpStatus.CREATED);
    }

    @PutMapping("/{sellerId}/promotions/{promotionId}")
    public ResponseEntity<PromotionDTO> updateSellerPromotion(
            @PathVariable String sellerId, 
            @PathVariable String promotionId, 
            @Valid @RequestBody PromotionDTO promotion, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.updateSellerPromotion(sellerId, promotionId, promotion));
    }

    @DeleteMapping("/{sellerId}/promotions/{promotionId}")
    public ResponseEntity<Void> deleteSellerPromotion(
            @PathVariable String sellerId, 
            @PathVariable String promotionId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        storeSellerService.deleteSellerPromotion(sellerId, promotionId);
        return ResponseEntity.noContent().build();
    }

    // Profile Management
    @GetMapping("/{sellerId}/profile")
    public ResponseEntity<SellerProfileDTO> getSellerProfile(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerProfile(sellerId));
    }

    @PutMapping("/{sellerId}/profile")
    public ResponseEntity<SellerProfileDTO> updateSellerProfile(
            @PathVariable String sellerId, 
            @Valid @RequestBody SellerProfileDTO profile, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.updateSellerProfile(sellerId, profile));
    }

    @PutMapping("/{sellerId}/store-settings")
    public ResponseEntity<SellerStoreSettingsDTO> updateStoreSettings(
            @PathVariable String sellerId, 
            @Valid @RequestBody SellerStoreSettingsDTO settings, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.updateStoreSettings(sellerId, settings));
    }

    // Reviews and Ratings
    @GetMapping("/{sellerId}/reviews")
    public ResponseEntity<List<SellerReviewDTO>> getSellerReviews(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerReviews(sellerId));
    }

    @PostMapping("/{sellerId}/reviews/{reviewId}/respond")
    public ResponseEntity<SellerReviewDTO> respondToReview(
            @PathVariable String sellerId, 
            @PathVariable String reviewId, 
            @RequestBody Map<String, String> request, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        String response = request.get("response");
        if (response == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(storeSellerService.respondToReview(sellerId, reviewId, response));
    }

    @GetMapping("/{sellerId}/rating-analytics")
    public ResponseEntity<SellerRatingAnalyticsDTO> getSellerRatingAnalytics(
            @PathVariable String sellerId, 
            Authentication authentication) {
        validateSellerAccess(sellerId, authentication);
        return ResponseEntity.ok(storeSellerService.getSellerRatingAnalytics(sellerId));
    }

    // Helper method to validate that a seller can only access their own data
    private void validateSellerAccess(String sellerId, Authentication authentication) {
        if (!storeSellerService.isSellerAuthorized(sellerId, authentication)) {
            throw new SecurityException("You are not authorized to access this seller's data");
        }
    }
}
