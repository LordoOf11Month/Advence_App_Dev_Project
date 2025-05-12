package com.example.controllers.admin;

import com.example.dto.*;
import com.example.services.AdminService;
import com.example.services.OrderService;
import com.example.services.ProductService;
import com.example.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;




@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminService adminService;
    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;

    // Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/order-stats")
    public ResponseEntity<OrderStats> getOrderStats() {
        return ResponseEntity.ok(adminService.getOrderStats());
    }

    // Product Management
    @GetMapping("/dashboard/products")
    public ResponseEntity<List<AdminProductDTO>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @GetMapping("/dashboard/products/{id}")
    public ResponseEntity<AdminProductDTO> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getProduct(id));
    }

    @PostMapping("/dashboard/products")
    public ResponseEntity<AdminProductDTO> createProduct(@RequestBody AdminProductDTO productDTO) {
        return ResponseEntity.ok(adminService.createProduct(productDTO));
    }

    @PutMapping("/dashboard/products/{id}")
    public ResponseEntity<AdminProductDTO> updateProduct(
            @PathVariable String id, 
            @Valid @RequestBody AdminProductDTO product) {
        return ResponseEntity.ok(adminService.updateProduct(id, product));
    }

    @DeleteMapping("/dashboard/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        adminService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/dashboard/products/{id}/approve")
    public ResponseEntity<AdminProductDTO> approveProduct(
            @PathVariable String id, 
            @RequestBody Map<String, Boolean> request) {
        Boolean approved = request.get("approved");
        if (approved == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.approveProduct(id, approved));
    }

    @PutMapping("/dashboard/products/{id}/image")
    public ResponseEntity<AdminProductDTO> updateProductImage(
            @PathVariable String id, 
            @RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        if (imageUrl == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.updateProductImage(id, imageUrl));
    }

    @PutMapping("/dashboard/products/{id}/toggle-free-shipping")
    public ResponseEntity<AdminProductDTO> toggleFreeShipping(
            @PathVariable String id, 
            @RequestBody Map<String, Boolean> request) {
        Boolean freeShipping = request.get("freeShipping");
        if (freeShipping == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.toggleFreeShipping(id, freeShipping));
    }

    @PutMapping("/dashboard/products/{id}/toggle-fast-delivery")
    public ResponseEntity<AdminProductDTO> toggleFastDelivery(
            @PathVariable String id, 
            @RequestBody Map<String, Boolean> request) {
        Boolean fastDelivery = request.get("fastDelivery");
        if (fastDelivery == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.toggleFastDelivery(id, fastDelivery));
    }

    // Order Management
    @GetMapping("/dashboard/orders")
    public ResponseEntity<List<AdminOrderDTO>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<AdminOrderDTO> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getOrder(id));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<AdminOrderDTO> updateOrderStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.updateOrderStatus(id, status));
    }

    @PutMapping("/orders/{id}/resolve-payment")
    public ResponseEntity<AdminOrderDTO> resolvePaymentIssue(@PathVariable String id) {
        return ResponseEntity.ok(adminService.resolvePaymentIssue(id));
    }

    @PutMapping("/orders/{id}/resolve-issue")
    public ResponseEntity<AdminOrderDTO> resolveOrderIssue(@PathVariable String id) {
        return ResponseEntity.ok(adminService.resolveOrderIssue(id));
    }

    // User Management
    @GetMapping("/dashboard/users")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/dashboard/users/{id}")
    public ResponseEntity<AdminUserDTO> getUser(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PutMapping("/dashboard/users/{id}/ban")
    public ResponseEntity<AdminUserDTO> banUser(@PathVariable String id) {
        return ResponseEntity.ok(adminService.banUser(id));
    }

    @PutMapping("/dashboard/users/{id}/unban")
    public ResponseEntity<AdminUserDTO> unbanUser(@PathVariable String id) {
        return ResponseEntity.ok(adminService.unbanUser(id));
    }

    @GetMapping("/dashboard/users/{id}/transactions")
    public ResponseEntity<List<UserTransactionDTO>> getUserTransactions(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getUserTransactions(id));
    }

    // Seller Management
    @GetMapping("/sellers")
    public ResponseEntity<List<AdminSellerDTO>> getAllSellers() {
        return ResponseEntity.ok(adminService.getAllSellers());
    }

    @GetMapping("/sellers/{id}")
    public ResponseEntity<AdminSellerDTO> getSeller(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getSeller(id));
    }

    @PutMapping("/sellers/{id}/approve")
    public ResponseEntity<AdminSellerDTO> approveSeller(
            @PathVariable String id, 
            @RequestBody Map<String, Boolean> request) {
        Boolean approved = request.get("approved");
        if (approved == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.approveSeller(id, approved));
    }

    @PutMapping("/sellers/{id}/commission")
    public ResponseEntity<AdminSellerDTO> updateSellerCommission(
            @PathVariable String id, 
            @RequestBody Map<String, Double> request) {
        Double commissionRate = request.get("commissionRate");
        if (commissionRate == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(adminService.updateSellerCommission(id, commissionRate));
    }

    @GetMapping("/sellers/{id}/performance")
    public ResponseEntity<SellerPerformanceDTO> getSellerPerformance(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getSellerPerformance(id));
    }
}
