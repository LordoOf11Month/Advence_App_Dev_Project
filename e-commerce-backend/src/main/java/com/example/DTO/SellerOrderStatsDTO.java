package com.example.DTO;

import lombok.Data;

@Data
public class SellerOrderStatsDTO {
    private int pendingOrders;
    private int completedOrders;
    private int cancelledOrders;
    private int returnedOrders;
} 