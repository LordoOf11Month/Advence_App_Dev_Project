package com.example.DTO;

import lombok.Data;

@Data
public class SellerStoreSettingsDTO {
    private String storeId;
    private boolean autoAcceptOrders;
    private int shippingDays;
    private boolean isVacationMode;
    private String returnPolicy;
    private String shippingPolicy;
} 