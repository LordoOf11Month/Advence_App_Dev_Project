package com.example.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DTO.admin.AdminOrderDTO;
import com.example.DTO.admin.AdminProductDTO;
import com.example.DTO.admin.AdminSellerDTO;
import com.example.DTO.admin.AdminStatsDTO;
import com.example.DTO.admin.AdminUserDTO;
import com.example.DTO.admin.OrderStats;
import com.example.DTO.admin.SellerPerformanceDTO;
import com.example.DTO.admin.UserTransactionDTO;
import com.example.models.Address;
import com.example.models.OrderEntity;
import com.example.repositories.OrderRepository;
import com.example.repositories.ProductRepository;
import com.example.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

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
        stats.setTotalUsers(1500L);
        stats.setTotalCustomers(1200L);
        stats.setTotalSellers(300L);
        stats.setTotalProducts(5000L);
        stats.setTotalOrders(3500L);
        stats.setTotalPendingOrders(150L);
        stats.setTotalCompletedOrders(3000L);
        stats.setTotalCanceledOrders(350L);
        stats.setTotalRevenue(BigDecimal.valueOf(250000.0));
        stats.setTotalProfit(BigDecimal.valueOf(50000.0));
        stats.setAverageOrderValue(BigDecimal.valueOf(75.0));
        stats.setConversionRate(BigDecimal.valueOf(3.2));
        
        Map<String, Long> usersByRegion = new HashMap<>();
        usersByRegion.put("North America", 800L);
        usersByRegion.put("Europe", 400L);
        usersByRegion.put("Asia", 200L);
        usersByRegion.put("Other", 100L);
        stats.setUsersByRegion(usersByRegion);
        
        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        revenueByCategory.put("Electronics", BigDecimal.valueOf(100000.0));
        revenueByCategory.put("Clothing", BigDecimal.valueOf(80000.0));
        revenueByCategory.put("Home", BigDecimal.valueOf(50000.0));
        revenueByCategory.put("Other", BigDecimal.valueOf(20000.0));
        stats.setRevenueByCategory(revenueByCategory);
        
        Map<String, BigDecimal> salesByMonth = new HashMap<>();
        salesByMonth.put("Jan", BigDecimal.valueOf(20000.0));
        salesByMonth.put("Feb", BigDecimal.valueOf(22000.0));
        salesByMonth.put("Mar", BigDecimal.valueOf(25000.0));
        stats.setSalesByMonth(salesByMonth);
        
        return stats;
    }
    
    /**
     * Get order statistics
     */
    public OrderStats getOrderStats() {
        OrderStats stats = new OrderStats();
        stats.setTotalOrders(3500L);
        stats.setTotalPendingOrders(120L);
        stats.setTotalProcessingOrders(85L);
        stats.setTotalShippedOrders(75L);
        stats.setTotalDeliveredOrders(2800L);
        stats.setTotalCanceledOrders(420L);
        stats.setTotalRefundedOrders(100L);
        stats.setTotalOrderValue(BigDecimal.valueOf(250000.0));
        stats.setAverageOrderValue(BigDecimal.valueOf(80.0));
        stats.setLastOrderDate(LocalDateTime.now());
        
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("pending", 120L);
        ordersByStatus.put("processing", 85L);
        ordersByStatus.put("shipped", 75L);
        ordersByStatus.put("delivered", 2800L);
        ordersByStatus.put("canceled", 420L);
        stats.setOrdersByStatus(ordersByStatus);
        
        Map<String, BigDecimal> orderValueByDay = new HashMap<>();
        orderValueByDay.put("Mon", BigDecimal.valueOf(5000.0));
        orderValueByDay.put("Tue", BigDecimal.valueOf(4800.0));
        orderValueByDay.put("Wed", BigDecimal.valueOf(5200.0));
        stats.setOrderValueByDay(orderValueByDay);
        
        Map<String, Long> ordersByPaymentMethod = new HashMap<>();
        ordersByPaymentMethod.put("Credit Card", 2000L);
        ordersByPaymentMethod.put("PayPal", 1000L);
        ordersByPaymentMethod.put("Bank Transfer", 500L);
        stats.setOrdersByPaymentMethod(ordersByPaymentMethod);
        
        stats.setOrderGrowthRate(12.5);
        
        return stats;
    }
    
    /**
     * Get all products for admin view
     */
    public List<AdminProductDTO> getAllProducts() {
        // Mock implementation
        return IntStream.range(1, 11)
            .mapToObj(i -> createMockProduct((long)i, "Product " + i, 99.99 * i))
            .collect(Collectors.toList());
    }
    
    /**
     * Get a specific product
     */
    public AdminProductDTO getProduct(String id) {
        return createMockProduct(Long.parseLong(id), "Product " + id, 99.99);
    }
    
    /**
     * Create a new product
     */
    public AdminProductDTO createProduct(AdminProductDTO product) {
        // Mock implementation
        product.setId(System.currentTimeMillis());
        return product;
    }
    
    /**
     * Update an existing product
     */
    public AdminProductDTO updateProduct(String id, AdminProductDTO product) {
        product.setId(Long.parseLong(id));
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
        product.setIsApproved(approved);
        return product;
    }
    
    /**
     * Update product image
     */
    public AdminProductDTO updateProductImage(String id, String imageUrl) {
        AdminProductDTO product = getProduct(id);
        List<String> images = product.getImageUrls();
        if (images == null) {
            images = List.of(imageUrl);
        } else {
            images.add(imageUrl);
        }
        product.setImageUrls(images);
        return product;
    }
    
    /**
     * Toggle free shipping for a product
     */
    public AdminProductDTO toggleFreeShipping(String id, boolean freeShipping) {
        AdminProductDTO product = getProduct(id);
        product.setHasFreeShipping(freeShipping);
        return product;
    }
    
    /**
     * Toggle fast delivery for a product
     */
    public AdminProductDTO toggleFastDelivery(String id, boolean fastDelivery) {
        AdminProductDTO product = getProduct(id);
        product.setHasFastDelivery(fastDelivery);
        return product;
    }
    
    /**
     * Helper method to create a mock product
     */
    private AdminProductDTO createMockProduct(Long id, String name, double price) {
        AdminProductDTO product = new AdminProductDTO();
        product.setId(id);
        product.setName(name);
        product.setDescription("Description for " + name);
        product.setPrice(BigDecimal.valueOf(price));
        product.setCostPrice(BigDecimal.valueOf(price * 0.7));
        product.setQuantity(100);
        product.setSku("SKU-" + id);
        product.setIsActive(true);
        product.setIsApproved(true);
        product.setIsFeatured(false);
        product.setHasFreeShipping(false);
        product.setHasFastDelivery(false);
        product.setSellerName("Seller " + (id % 5 + 1));
        product.setSellerId((long)(id % 5 + 1));
        product.setCreatedAt(LocalDateTime.now().minusDays(id));
        product.setUpdatedAt(LocalDateTime.now());
        product.setImageUrls(List.of("https://example.com/img" + id + ".jpg"));
        product.setCategoryNames(List.of("Category " + (id % 3 + 1)));
        product.setReviewCount((int)(id * 10));
        product.setAverageRating(4.5);
        return product;
    }
    
    /**
     * Get all orders for admin view
     */
    public List<AdminOrderDTO> getAllOrders() {
        List<OrderEntity> allOrders = orderRepository.findAll();
        return allOrders.stream().map(this::convertToAdminOrderDTO).collect(Collectors.toList());
    }
    
    /**
     * Convert OrderEntity to AdminOrderDTO
     */
    private AdminOrderDTO convertToAdminOrderDTO(OrderEntity order) {
        AdminOrderDTO dto = new AdminOrderDTO();
        dto.setId(order.getId().toString());
        dto.setStatus(order.getStatus().toString());
        
        // Format dates
        if (order.getCreatedAt() != null) {
            dto.setOrderDate(order.getCreatedAt().toString());
        }
        
        // Set user information
        if (order.getUser() != null) {
            dto.setCustomerId(String.valueOf(order.getUser().getId()));
            dto.setCustomerName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        }
        
        // Set shipping address
        if (order.getShippingAddress() != null) {
            Address address = order.getShippingAddress();
            dto.setShippingAddress(address.getStreet() + ", " + 
                                  address.getCity() + ", " + 
                                  address.getState() + ", " + 
                                  address.getCountry() + " " + 
                                  address.getZipCode());
        }
        
        // Set order items
        if (order.getOrderItems() != null) {
            List<AdminOrderDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    AdminOrderDTO.OrderItemDTO itemDTO = new AdminOrderDTO.OrderItemDTO();
                    itemDTO.setProductId(item.getProduct().getId().toString());
                    itemDTO.setProductName(item.getProduct().getName());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setPrice(item.getPriceAtPurchase().doubleValue());
                    return itemDTO;
                })
                .collect(Collectors.toList());
            dto.setItems(itemDTOs);
            
            // Calculate total amount
            double total = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPriceAtPurchase().doubleValue() * item.getQuantity())
                .sum();
            dto.setTotalAmount(total);
        }
        
        return dto;
    }
    
    /**
     * Get a specific order
     */
    public AdminOrderDTO getOrder(String id) {
        try {
            Long orderId = Long.parseLong(id);
            OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
            return convertToAdminOrderDTO(order);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + id);
        }
    }
    
    /**
     * Update order status
     */
    public AdminOrderDTO updateOrderStatus(String id, String status) {
        try {
            Long orderId = Long.parseLong(id);
            OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
            
            try {
                OrderEntity.Status newStatus = OrderEntity.Status.valueOf(status.toLowerCase());
                order.setStatus(newStatus);
                orderRepository.save(order);
                return convertToAdminOrderDTO(order);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid order status: " + status);
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid order ID format: " + id);
        }
    }
    
    /**
     * Resolve payment issue for an order
     */
    public AdminOrderDTO resolvePaymentIssue(String id) {
        AdminOrderDTO dto = getOrder(id);
        dto.setPaymentResolved(true);
        
        // In a real implementation, you might want to perform some payment processing actions
        // For now, we're just marking the payment as resolved in the DTO
        
        return dto;
    }
    
    /**
     * Resolve general issue for an order
     */
    public AdminOrderDTO resolveOrderIssue(String id) {
        AdminOrderDTO dto = getOrder(id);
        dto.setIssueResolved(true);
        
        // In a real implementation, you might want to perform some order issue resolution actions
        // For now, we're just marking the issue as resolved in the DTO
        
        return dto;
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
        try {
            performance.setSellerId(Long.parseLong(id));
            performance.setTotalSales(25000.0);
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
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid seller ID format: " + id);
        }
    }
    
    // Helper methods to create mock objects
    
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
        try {
            user.setId(Long.parseLong(id));
            user.setUsername("user" + id);
            user.setEmail(name.toLowerCase().replace(" ", ".") + id + "@example.com");
            user.setFullName(name);
            user.setRole(Integer.parseInt(id) % 5 == 0 ? 1 : Integer.parseInt(id) % 3 == 0 ? 2 : 3);
            user.setRegistrationDate(LocalDateTime.now().minusDays(Long.parseLong(id) * 10).toString());
            user.setLastLoginDate(LocalDateTime.now().minusDays(Long.parseLong(id)).toString());
            user.setBanned(banned);
            user.setTotalOrders(Integer.parseInt(id) * 5);
            user.setTotalSpent(Integer.parseInt(id) * 100.0);
            return user;
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID format: " + id);
        }
    }
    
    private UserTransactionDTO createMockTransaction(String id, String reference, double amount) {
        UserTransactionDTO transaction = new UserTransactionDTO();
        try {
            transaction.setId(Long.parseLong(id));
            transaction.setReference(reference);
            transaction.setAmount(BigDecimal.valueOf(amount));
            transaction.setType("purchase");
            transaction.setStatus("completed");
            transaction.setDate(LocalDateTime.now().minusDays(Long.parseLong(id) * 5).toString());
            return transaction;
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid transaction ID format: " + id);
        }
    }
    
    private AdminSellerDTO createMockSeller(String id, String name, boolean approved) {
        AdminSellerDTO seller = new AdminSellerDTO();
        try {
            seller.setId(Long.parseLong(id));
            seller.setStoreName("Store " + id);
            seller.setOwnerName(name);
            seller.setEmail(name.toLowerCase().replace(" ", ".") + id + "@example.com");
            seller.setRegistrationDate(LocalDateTime.now().minusDays(Long.parseLong(id) * 15).toString());
            seller.setApproved(approved);
            seller.setTotalProducts(Integer.parseInt(id) * 10);
            seller.setTotalRevenue(BigDecimal.valueOf(Integer.parseInt(id) * 1000.0));
            seller.setCommissionRate(10.0);
            seller.setRating(4.5);
            return seller;
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid seller ID format: " + id);
        }
    }
} 