package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int id;

    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 20, nullable = false)
    private String lastName;

    @Column(name = "email", length = 70, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 128, nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId;

    @Column(name = "is_banned", nullable = false)
    private Boolean isBanned = false;

    @Column(name = "banned_at")
    private OffsetDateTime bannedAt;

    @Column(name = "ban_reason", columnDefinition = "TEXT")
    private String banReason;

    @OneToMany(mappedBy = "seller")
    private List<Store> stores;

    @OneToMany(mappedBy = "user")
    private List<OrderEntity> orders;

    @OneToMany(mappedBy = "user")
    private List<PaymentMethod> paymentMethods;

    @OneToMany(mappedBy = "user")
    private List<Address> addresses;

    @OneToMany(mappedBy = "user")
    private List<CartItem> cartItems;

    public enum Role {
        customer,
        seller,
        platform_admin
    }
}