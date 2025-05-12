package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;



@Entity
@Table(name = "orders")
@Getter @Setter
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "stripe_charge_id", length = 255)
    private String stripeChargeId;

    @ManyToOne
    @JoinColumn(name = "shipping_address", nullable = false)
    private Address shippingAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private Status status;

    public  enum Status {
        pending,
        processing,
        shipped,
        delivered,
        cancelled;
    }

    @Column(name = "estimated_delivery")
    private LocalDate estimatedDelivery;

    @Column(name = "actual_delivery_date")
    private Timestamp actualDeliveryDate;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems;
}


