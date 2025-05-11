package com.example.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter @Setter
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"products", "orders", "hibernateLazyInitializer", "handler"})
    private Store store;

    @ManyToOne()
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"products", "hibernateLazyInitializer", "handler"})
    private Category category;

    @Column(name = "name", length = 80, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "approved", nullable = false)
    private boolean approved = false;

    @Column(name = "free_shipping", nullable = false)
    private boolean freeShipping = false;

    @Column(name = "fast_delivery", nullable = false)
    private boolean fastDelivery = false;

    // pre-calculated rating values for removing useless join queries
    @Column(name = "average_rating")
    private Float averageRating;

    @Column(name = "rating_count")
    private Integer ratingCount;

    //used for computation of new average after new review
    @Column(name = "total_rating")
    private Integer totalRating;

    //pre-calcuated total sales for dashboards
    @Column(name = "total_sales")
    private Integer totalSales;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product")
    @JsonIgnoreProperties({"product", "hibernateLazyInitializer", "handler"})
    private List<ProductImage> images;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"product", "hibernateLazyInitializer", "handler"})
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "product")
    @JsonIgnoreProperties({"product", "hibernateLazyInitializer", "handler"})
    private List<Discount> discounts;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"product", "user", "hibernateLazyInitializer", "handler"})
    private List<Review> reviews;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}