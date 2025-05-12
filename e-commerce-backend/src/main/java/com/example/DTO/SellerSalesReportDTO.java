package com.example.DTO;

import lombok.Data;

@Data
public class SellerSalesReportDTO {
    private double totalSales;
    private int itemsSold;
    private String startDate;
    private String endDate;
} 