package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
@Getter @Setter
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private RefundStatus status;

    @Column(name = "reason")
    private String reason;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "stripe_refund_id")
    private String stripeRefundId;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public enum RefundStatus {
        PENDING,
        COMPLETED,
        FAILED,
        REJECTED
    }
} 