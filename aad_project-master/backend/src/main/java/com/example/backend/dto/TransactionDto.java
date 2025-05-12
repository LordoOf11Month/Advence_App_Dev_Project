// TransactionDto.java
package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO aggregating Order and Payment transaction data for admin/seller views.
 */
@Data
@NoArgsConstructor            // ModelMapper veya manuel map’leme için lazım
@AllArgsConstructor           // JPQL constructor expression için
public class TransactionDto {

    private Long orderId;
    private Long paymentId;
    private String buyerEmail;
    private String sellerEmail;
    private BigDecimal amount;
    private String paymentStatus;
    private String shipmentStatus;
    private LocalDateTime createdAt;
}
