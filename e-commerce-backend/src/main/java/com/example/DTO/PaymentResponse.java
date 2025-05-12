package com.example.DTO;

public class PaymentResponse {
    private String clientSecret;

    public PaymentResponse(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    // Getter
    public String getClientSecret() {
        return clientSecret;
    }

    // Setter (optional, but good practice)
    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
} 