// DashboardController.java
package com.example.controllers;

import com.example.DTO.SellerDashboardDTO.*;
import com.example.services.DashboardService; // You'll need a DashboardService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<DashboardDataDTO> getDashboardData(@PathVariable String sellerId) {
        // You'll need a service method to fetch all dashboard data
        DashboardDataDTO dashboardData = dashboardService.getDashboardDataForSeller(sellerId);
        return ResponseEntity.ok(dashboardData);
    }

    //admins dashboard will be given from here


    // You might also have separate endpoints for specific data if needed
    // @GetMapping("/seller/{sellerId}/summary")
    // public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(@PathVariable String sellerId) { ... }

    // @GetMapping("/seller/{sellerId}/recent-orders")
    // public ResponseEntity<List<RecentOrderDTO>> getRecentOrders(@PathVariable String sellerId) { ... }

    // @GetMapping("/seller/{sellerId}/low-stock")
    // public ResponseEntity<List<LowStockItemDTO>> getLowStockItems(@PathVariable String sellerId) { ... }
}