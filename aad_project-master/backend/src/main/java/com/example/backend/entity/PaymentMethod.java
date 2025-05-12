package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_methods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    // Payment method type (e.g., CREDIT_CARD, PAYPAL, BANK_TRANSFER)
    private String type;
    
    // Card/account details (partially masked for security)
    private String accountNumber; // Last 4 digits for cards
    private String cardholderName;
    
    // For credit cards
    @Column(name = "expiration_month")
    private Integer expirationMonth;
    
    @Column(name = "expiration_year")
    private Integer expirationYear;
    
    // We don't store CVV or full card numbers for security reasons
    
    // For display and selection purposes
    private String nickname;
    
    @Column(name = "is_primary")
    private boolean primary;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor without ID for creating new payment methods
    public PaymentMethod(User user, String type, String accountNumber, String cardholderName,
                        Integer expirationMonth, Integer expirationYear, String nickname, boolean primary) {
        this.user = user;
        this.type = type;
        this.accountNumber = accountNumber;
        this.cardholderName = cardholderName;
        this.expirationMonth = expirationMonth;
        this.expirationYear = expirationYear;
        this.nickname = nickname;
        this.primary = primary;
    }
} 