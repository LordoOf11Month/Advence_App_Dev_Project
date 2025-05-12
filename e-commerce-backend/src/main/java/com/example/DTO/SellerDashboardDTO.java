package com.example.DTO;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class SellerDashboardDTO {

    @Data
    public static class DashboardSummaryDTO {
        private int todayOrders;
        private BigDecimal todayRevenue;
        private int orderChange;
        private int revenueChange;
        private int activeProducts;
        private int lowStockProducts;
        private double rating; // Keep as double since it's a rating, not currency
        private int totalReviews;
        private int totalRevenue;
        private int totalProducts;
        private int totalOrders;
        // Constructors, getters, and setters
    }

    @Data
    public static class RecentOrderDTO {
        private String id;
        private int userId;
        private String userEmail;
        private String customerName;
        private List<OrderDTO.OrderItemDTO> items;
        private BigDecimal totalAmount;
        private BigDecimal total;
        private String status;
        private String sellerId;
        private String sellerName;
        private Date dateUpdated;
        private Date createdAt;
        private String shippingAddress;

    }

    @Data
    public static class LowStockItemDTO {
        private Long id;
        private String title;
        private BigDecimal price;
        private String image; // only primary image's URL
        private int stock;
        // Constructors, getters, and setters
    }

    @Data
    public static class DashboardDataDTO {
        private DashboardSummaryDTO summary;
        private List<RecentOrderDTO> recentOrders;
        private List<LowStockItemDTO> lowStockItems;

        // Constructors, getters, and setters
    }


}
