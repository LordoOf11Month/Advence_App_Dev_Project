package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", referencedColumnName = "order_id")
    private Order order;

    private BigDecimal amount;
    private String method; // e.g., "CREDIT_CARD", "PAYPAL", etc.
    private String transactionId;
    private String status; // e.g., "PENDING", "COMPLETED", "FAILED"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Payment(Order order, BigDecimal amount, String method, String transactionId, String status) {
        this.order = order;
        this.amount = amount;
        this.method = method;
        this.transactionId = transactionId;
        this.status = status;
    }
} 