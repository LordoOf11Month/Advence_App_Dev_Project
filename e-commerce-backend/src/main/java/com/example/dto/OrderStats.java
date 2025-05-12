package com.example.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderStats {
    private Long pendingOrders;
    private Long processingOrders;
    private Long shippedOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private Long refundedOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
} 