package com.example.services;

import com.example.DTO.ProductDTO.CreateProductRequest;
import com.example.DTO.SellerDashboardDTO.*;
import com.example.models.OrderEntity;
import com.example.models.OrderItem;
import com.example.models.Product;
import com.example.repositories.StoreRepository;
import com.example.repositories.OrderRepository;
import com.example.repositories.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.DTO.OrderDTO.OrderItemDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class DashboardService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    public DashboardDataDTO getDashboardDataForSeller(String sellerId) {
        DashboardDataDTO dashboardData = new DashboardDataDTO();

        try {
            // Validate sellerId
            if (sellerId == null || sellerId.isEmpty()) {
                throw new IllegalArgumentException("Seller ID cannot be null or empty");
            }

            int sellerIdInt = Integer.parseInt(sellerId);

            // Populate dashboard summary
            DashboardSummaryDTO summary = createDashboardSummary(sellerIdInt);
            dashboardData.setSummary(summary);

            // Fetch recent orders
            List<OrderEntity> allOrders = orderRepository.findAll();

            List<RecentOrderDTO> recentOrders = allOrders.stream()
                    .filter(order -> order.getOrderItems().stream()
                            .anyMatch(item -> item.getProduct().getStore().getSeller().getId() == sellerIdInt))
                    .sorted(Comparator.comparing(OrderEntity::getCreatedAt).reversed())
                    .map(this::mapToRecentOrderDTO)
                    .collect(Collectors.toList());
            dashboardData.setRecentOrders(recentOrders);

            // Fetch low stock items
            List<Product> lowStockProducts = productRepository.findLowStockProductsBySellerId(sellerIdInt);
            List<LowStockItemDTO> lowStockItems = lowStockProducts.stream()
                    .map(this::mapToLowStockItemDTO)
                    .collect(Collectors.toList());
            dashboardData.setLowStockItems(lowStockItems);

        } catch (Exception e) {
            // Handle and log exceptions as appropriate
            System.err.println("Error while fetching dashboard data: " + e.getMessage());
        }

        return dashboardData;
    }

    private DashboardSummaryDTO createDashboardSummary(int sellerIdInt) {
        DashboardSummaryDTO summary = new DashboardSummaryDTO();

        // Calculate total revenue
        List<OrderEntity> sellerOrders = orderRepository.findOrdersBySellerId(sellerIdInt);
        BigDecimal totalRevenue = sellerOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .filter(item -> item.getProduct().getStore().getSeller().getId() == sellerIdInt)
                .map(item -> item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        summary.setTotalRevenue(totalRevenue.intValue());

        // Calculate total orders
        long totalOrders = sellerOrders.stream()
                .filter(order -> order.getOrderItems().stream()
                        .anyMatch(item -> item.getProduct().getStore().getSeller().getId() == sellerIdInt))
                .count();
        summary.setTotalOrders((int) totalOrders);


        return summary;
    }

    private RecentOrderDTO mapToRecentOrderDTO(OrderEntity orderEntity) {
        RecentOrderDTO dto = new RecentOrderDTO();
        dto.setId(orderEntity.getId() != null ? orderEntity.getId().toString() : null);
        dto.setUserId(orderEntity.getUser() != null ? orderEntity.getUser().getId() : 0);
        dto.setUserEmail(orderEntity.getUser() != null ? orderEntity.getUser().getEmail() : null);

        String customerName = (orderEntity.getUser() != null)
                ? orderEntity.getUser().getFirstName() + " " + orderEntity.getUser().getLastName()
                : null;
        dto.setCustomerName(customerName);

        dto.setItems(orderEntity.getOrderItems().stream()
                .map(this::mapToOrderItemDTO)
                .collect(Collectors.toList()));

        BigDecimal totalAmount = orderEntity.getOrderItems().stream()
                .map(item -> item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setTotalAmount(totalAmount);
        dto.setStatus(orderEntity.getStatus() != null ? orderEntity.getStatus().name() : null);
        dto.setSellerName("Seller Store Name");
        dto.setDateUpdated(orderEntity.getUpdatedAt() != null ? new java.util.Date(orderEntity.getUpdatedAt().getTime()) : null);
        dto.setCreatedAt(orderEntity.getCreatedAt() != null ? new java.util.Date(orderEntity.getCreatedAt().getTime()) : null);
        dto.setShippingAddress(orderEntity.getShippingAddress() != null ? orderEntity.getShippingAddress().toString() : null);

        return dto;
    }

    private LowStockItemDTO mapToLowStockItemDTO(Product product) {
        LowStockItemDTO dto = new LowStockItemDTO();
        dto.setId(product.getId());
        dto.setTitle(product.getName());
        dto.setStock(product.getStockQuantity());
        return dto;
    }

    private OrderItemDTO mapToOrderItemDTO(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setProduct(mapToCreateProductDTO(orderItem.getProduct()));
        dto.setQuantity(orderItem.getQuantity() != null ? orderItem.getQuantity() : 0);
        dto.setPriceAtPurchase(orderItem.getPriceAtPurchase() != null ? orderItem.getPriceAtPurchase() : BigDecimal.ZERO);
        return dto;
    }

    private CreateProductRequest mapToCreateProductDTO(Product product) {
        CreateProductRequest dto = new CreateProductRequest();
        dto.setTitle(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategory(product.getCategory() != null ? product.getCategory().getName() : null);
        return dto;
    }

}