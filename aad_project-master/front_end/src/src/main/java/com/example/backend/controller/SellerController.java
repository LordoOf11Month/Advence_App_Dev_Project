package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.OrderService;
import com.example.backend.service.ProductService;
import com.example.backend.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasAnyRole('SELLER', 'PLATFORM_ADMIN')")
public class SellerController {

    @Autowired private OrderService orderService;
    @Autowired private ProductService productService;
    @Autowired private ShipmentService shipmentService;

    /* ---------- ORDERS ---------- */
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getSellerOrders(Authentication authentication) {
        List<OrderDTO> orders = orderService.findSellerOrders(authentication);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(id, status, authentication);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", updatedOrder));
    }

    /* ---------- PRODUCTS ---------- */
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getSellerProducts(Authentication authentication) {
        List<ProductDTO> products = productService.findSellerProducts(authentication);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @RequestBody ProductDTO productDTO,
            Authentication authentication) {
        ProductDTO created = productService.createSellerProduct(productDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product created", created));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO productDTO,
            Authentication authentication) {
        ProductDTO updated = productService.updateSellerProduct(id, productDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product updated", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        productService.deleteSellerProduct(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    /* ---------- SHIPMENTS ---------- */
    @GetMapping("/shipments")
    public ResponseEntity<ApiResponse<List<ShipmentDTO>>> getSellerShipments(Authentication authentication) {
        List<ShipmentDTO> shipments = shipmentService.findSellerShipments(authentication);
        return ResponseEntity.ok(ApiResponse.success(shipments));
    }

    @PutMapping("/shipments/{id}/status")
    public ResponseEntity<ApiResponse<ShipmentDTO>> updateShipmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String status        = body.get("status");
        String trackingNo    = body.get("trackingNumber");
        ShipmentDTO updated  = shipmentService.updateShipmentStatus(id, status, trackingNo, authentication);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated", updated));
    }

    /* ---------- TRANSACTION SUMMARY (renamed) ---------- */
    @GetMapping("/transactions/report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerTransactionReport(
            @RequestParam(required = false) String period,
            Authentication authentication) {
        Map<String, Object> report = orderService.getSellerTransactions(period, authentication);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    /* ---------- DASHBOARD STATS ---------- */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSellerStats(Authentication authentication) {
        Map<String, Object> stats = orderService.getSellerTransactions(null, authentication);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
