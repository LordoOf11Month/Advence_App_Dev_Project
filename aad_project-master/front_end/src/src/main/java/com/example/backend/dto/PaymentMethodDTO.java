package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDTO {
    private Long id;
    private Long userId;
    private String type;
    private String accountNumber; // Last 4 digits for cards
    private String cardholderName;
    private Integer expirationMonth;
    private Integer expirationYear;
    private String nickname;
    private boolean primary;
} 