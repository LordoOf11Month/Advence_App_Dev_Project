package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_methods")
@Getter @Setter
public class PaymentMethod {
    @Id
    @Column(name = "stripe_payment_method_id", length = 255)
    private String stripePaymentMethodId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Enum for card brands
    public enum CardBrand {
        VISA,
        MASTERCARD,
        AMERICAN_EXPRESS,
        DISCOVER,
        OTHER // Add more brands as needed
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "brand", length = 50, nullable = false)
    private CardBrand brand;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "last_4_digits", length = 4)
    private String last4Digits;

    @Column(name = "exp_month", nullable = false)
    private Integer expMonth;

    @Column(name = "exp_year", nullable = false)
    private Integer expYear;
}
