package com.example.dto;

import lombok.Data;

@Data
public class UserTransactionDTO {
    private String id;
    private String reference;
    private double amount;
    private String type;
    private String status;
    private String date;
}
