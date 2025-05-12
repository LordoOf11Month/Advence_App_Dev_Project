package com.example.dto;

import lombok.Data;

@Data
public class AdminUserDTO {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String registrationDate;
    private String lastLoginDate;
    private boolean banned;
    private int totalOrders;
    private double totalSpent;
}
