package com.example.services;

import com.example.dto.*;
import com.example.models.*;
import com.example.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    
    /**
     * Get admin dashboard statistics
     */
    public AdminStatsDTO getAdminStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        stats.setTotalUsers(1500);
        stats.setTotalProducts(5000);
        stats.setTotalOrders(3500);
        stats.setTotalRevenue(250000.0);
        stats.setMonthlyUsers(150);
        stats.setMonthlyProducts(300);
        stats.setMonthlyOrders(450);
        stats.setMonthlyRevenue(35000.0);
        return stats;
    }
    
    /**
     * Get order statistics
     */
    public OrderStats getOrderStats() {
        OrderStats stats = new OrderStats();
        stats.setPendingOrders(120L);
        stats.setProcessingOrders(85L);
        stats.setShippedOrders(75L);
        stats.setDeliveredOrders(2800L);
        stats.setCancelledOrders(420L);
        stats.setRefundedOrders(100L);
        stats.setTotalRevenue(BigDecimal.valueOf(250000.0));
        stats.setAverageOrderValue(BigDecimal.valueOf(80.0));
        return stats;
    }
    
    /**
     * Get all products for admin view
     */
    public List<AdminProductDTO> getAllProducts() {
        // Mock implementation
        return IntStream.range(1, 11)
            .mapToObj(i -> createMockProduct(String.valueOf(i), "Product " + i, 99.99 * i))
            .collect(Collectors.toList());
    }
    
    /**
     * Get a specific product
     */
    public AdminProductDTO getProduct(String id) {
        return createMockProduct(id, "Product " + id, 99.99);
    }
    
    /**
     * Create a new product
     */
    public AdminProductDTO createProduct(AdminProductDTO product) {
        // Mock implementation
        product.setId(String.valueOf(System.currentTimeMillis()));
        return product;
    }
    
    /**
     * Update an existing product
     */
    public AdminProductDTO updateProduct(String id, AdminProductDTO product) {
        product.setId(id);
        return product;
    }
    
    /**
     * Delete a product
     */
    @Transactional
    public void deleteProduct(String id) {
        // Mock implementation - would delete from database
    }
    
    /**
     * Approve or reject a product
     */
    public AdminProductDTO approveProduct(String id, boolean approved) {
        AdminProductDTO product = getProduct(id);
        product.setApproved(approved);
        return product;
    }
    
    /**
     * Update product image
     */
    public AdminProductDTO updateProductImage(String id, String imageUrl) {
        AdminProductDTO product = getProduct(id);
        product.setImageUrl(imageUrl);
        return product;
    }
    
    /**
     * Toggle free shipping for a product
     */
    public AdminProductDTO toggleFreeShipping(String id, boolean freeShipping) {
        AdminProductDTO product = getProduct(id);
        product.setFreeShipping(freeShipping);
        return product;
    }
    
    /**
     * Toggle fast delivery for a product
     */
    public AdminProductDTO toggleFastDelivery(String id, boolean fastDelivery) {
        AdminProductDTO product = getProduct(id);
        product.setFastDelivery(fastDelivery);
        return product;
    }
    
    /**
     * Get all orders for admin view
     */
    public List<AdminOrderDTO> getAllOrders() {
        return IntStream.range(1, 11)
            .mapToObj(i -> {
                String status = i % 3 == 0 ? "pending" : i % 3 == 1 ? "completed" : "cancelled";
                return createMockOrder(String.valueOf(1000 + i), status);
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get a specific order
     */
    public AdminOrderDTO getOrder(String id) {
        return createMockOrder(id, "pending");
    }
    
    /**
     * Update order status
     */
    public AdminOrderDTO updateOrderStatus(String id, String status) {
        AdminOrderDTO order = getOrder(id);
        order.setStatus(status);
        return order;
    }
    
    /**
     * Resolve payment issue for an order
     */
    public AdminOrderDTO resolvePaymentIssue(String id) {
        AdminOrderDTO order = getOrder(id);
        order.setPaymentResolved(true);
        return order;
    }
    
    /**
     * Resolve general issue for an order
     */
    public AdminOrderDTO resolveOrderIssue(String id) {
        AdminOrderDTO order = getOrder(id);
        order.setIssueResolved(true);
        return order;
    }
    
    /**
     * Get all users for admin view
     */
    public List<AdminUserDTO> getAllUsers() {
        return IntStream.range(1, 11)
            .mapToObj(i -> createMockUser(String.valueOf(i), "User " + i, i % 3 == 0))
            .collect(Collectors.toList());
    }
    
    /**
     * Get a specific user
     */
    public AdminUserDTO getUser(String id) {
        return createMockUser(id, "User " + id, false);
    }
    
    /**
     * Ban a user
     */
    public AdminUserDTO banUser(String id) {
        AdminUserDTO user = getUser(id);
        user.setBanned(true);
        return user;
    }
    
    /**
     * Unban a user
     */
    public AdminUserDTO unbanUser(String id) {
        AdminUserDTO user = getUser(id);
        user.setBanned(false);
        return user;
    }
    
    /**
     * Get user transactions
     */
    public List<UserTransactionDTO> getUserTransactions(String id) {
        return IntStream.range(1, 6)
            .mapToObj(i -> createMockTransaction(String.valueOf(i), "Order #" + (1000 + i), 99.99 * i))
            .collect(Collectors.toList());
    }
    
    /**
     * Get all sellers for admin view
     */
    public List<AdminSellerDTO> getAllSellers() {
        return IntStream.range(1, 11)
            .mapToObj(i -> createMockSeller(String.valueOf(i), "Seller " + i, i % 4 == 0))
            .collect(Collectors.toList());
    }
    
    /**
     * Get a specific seller
     */
    public AdminSellerDTO getSeller(String id) {
        return createMockSeller(id, "Seller " + id, false);
    }
    
    /**
     * Approve a seller
     */
    public AdminSellerDTO approveSeller(String id, boolean approved) {
        AdminSellerDTO seller = getSeller(id);
        seller.setApproved(approved);
        return seller;
    }
    
    /**
     * Update seller commission rate
     */
    public AdminSellerDTO updateSellerCommission(String id, double commissionRate) {
        AdminSellerDTO seller = getSeller(id);
        seller.setCommissionRate(commissionRate);
        return seller;
    }
    
    /**
     * Get seller performance metrics
     */
    public SellerPerformanceDTO getSellerPerformance(String id) {
        SellerPerformanceDTO performance = new SellerPerformanceDTO();
        performance.setSellerId(id);
        performance.setTotalSales(15000.0);
        performance.setTotalOrders(120);
        performance.setAverageRating(4.7);
        performance.setCancelRate(0.03);
        performance.setReturnRate(0.05);
        
        // Monthly performance data
        Map<String, Double> monthlySales = Map.of(
            "Jan", 1200.0,
            "Feb", 1500.0,
            "Mar", 1800.0,
            "Apr", 2100.0,
            "May", 2400.0,
            "Jun", 2700.0
        );
        performance.setMonthlySales(monthlySales);
        
        return performance;
    }
    
    // Helper methods to create mock objects
    
    private AdminProductDTO createMockProduct(String id, String name, double price) {
        AdminProductDTO product = new AdminProductDTO();
        product.setId(id);
        product.setTitle(name);
        product.setPrice(BigDecimal.valueOf(price));
        product.setDescription("This is a sample product");
        product.setCategory("Electronics");
        product.setStock(100);
        product.setImageUrl("https://example.com/image.jpg");
        product.setSellerId("seller-" + id);
        product.setSellerName("Seller " + id);
        product.setApproved(true);
        product.setFreeShipping(Integer.parseInt(id) % 2 == 0);
        product.setFastDelivery(Integer.parseInt(id) % 3 == 0);
        product.setDateAdded(LocalDateTime.now().minusDays(Long.parseLong(id)));
        return product;
    }
    
    private AdminOrderDTO createMockOrder(String id, String status) {
        AdminOrderDTO order = new AdminOrderDTO();
        order.setId(id);
        order.setCustomerId("customer-" + id);
        order.setCustomerName("Customer " + id);
        order.setOrderDate(LocalDateTime.now().minusDays(Long.parseLong(id)).toString());
        order.setStatus(status);
        order.setTotalAmount(199.99);
        order.setShippingAddress("123 Main St, City, Country");
        order.setPaymentMethod("Credit Card");
        order.setPaymentResolved(true);
        order.setIssueResolved(true);
        return order;
    }
    
    private AdminUserDTO createMockUser(String id, String name, boolean banned) {
        AdminUserDTO user = new AdminUserDTO();
        user.setId(id);
        user.setUsername(name.toLowerCase().replace(" ", ".") + id);
        user.setEmail(name.toLowerCase().replace(" ", ".") + id + "@example.com");
        user.setFullName(name);
        user.setRole(Integer.parseInt(id) % 5 == 0 ? "ADMIN" : Integer.parseInt(id) % 3 == 0 ? "SELLER" : "USER");
        user.setRegistrationDate(LocalDateTime.now().minusDays(Long.parseLong(id) * 10).toString());
        user.setLastLoginDate(LocalDateTime.now().minusDays(Long.parseLong(id)).toString());
        user.setBanned(banned);
        user.setTotalOrders(Integer.parseInt(id) * 5);
        user.setTotalSpent(Integer.parseInt(id) * 100.0);
        return user;
    }
    
    private UserTransactionDTO createMockTransaction(String id, String reference, double amount) {
        UserTransactionDTO transaction = new UserTransactionDTO();
        transaction.setId(id);
        transaction.setReference(reference);
        transaction.setAmount(amount);
        transaction.setType("purchase");
        transaction.setStatus("completed");
        transaction.setDate(LocalDateTime.now().minusDays(Long.parseLong(id) * 5).toString());
        return transaction;
    }
    
    private AdminSellerDTO createMockSeller(String id, String name, boolean approved) {
        AdminSellerDTO seller = new AdminSellerDTO();
        seller.setId(id);
        seller.setStoreName(name + "'s Store");
        seller.setOwnerName(name);
        seller.setEmail(name.toLowerCase().replace(" ", ".") + id + "@example.com");
        seller.setRegistrationDate(LocalDateTime.now().minusDays(Long.parseLong(id) * 15).toString());
        seller.setApproved(approved);
        seller.setTotalProducts(Integer.parseInt(id) * 10);
        seller.setTotalRevenue(Integer.parseInt(id) * 1000.0);
        seller.setCommissionRate(10.0);
        seller.setRating(4.5);
        return seller;
    }
} 