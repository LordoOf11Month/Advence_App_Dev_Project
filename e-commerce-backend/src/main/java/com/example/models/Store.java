package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "stores")
@Getter @Setter
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long storeId;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "store_name", length = 20, nullable = false)
    private String storeName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    // payment info
    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_holder", length = 100)
    private String accountHolder;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @OneToMany(mappedBy = "store")
    private List<Product> products;
}