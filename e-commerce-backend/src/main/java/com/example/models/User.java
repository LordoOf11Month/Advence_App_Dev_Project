package com.example.models;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
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

    @Column(name = "phone_number", length = 30, nullable = true) // Assuming phone number can be optional
    private String phoneNumber;

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

    @Column(name = "avatar_url" , columnDefinition = "TEXT")
    private String avatarUrl;

    @OneToMany(mappedBy = "seller", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"seller", "products", "hibernateLazyInitializer", "handler"})
    private List<Store> stores;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "hibernateLazyInitializer", "handler"})
    private List<OrderEntity> orders;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "hibernateLazyInitializer", "handler"})
    private List<PaymentMethod> paymentMethods;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "hibernateLazyInitializer", "handler"})
    private List<Address> addresses;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "hibernateLazyInitializer", "handler"})
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"user", "product", "hibernateLazyInitializer", "handler"})
    private List<Review> reviews;

    // Many-to-many relationship for favorite products
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_favorite_products",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @JsonIgnoreProperties({"reviews", "favoriteUsers", "hibernateLazyInitializer", "handler"})
    private List<Product> favoriteProducts = new ArrayList<>();

    public enum Role {
        customer,
        seller,
        admin
    }
}