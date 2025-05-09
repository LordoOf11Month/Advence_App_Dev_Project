package com.example.DTO;


import lombok.Data;

public class PaymentDTO {
    @Data
    public static class PaymentRequest {
        private Long orderId;
        private Long amount;
        private String currency = "usd";
    }
}
