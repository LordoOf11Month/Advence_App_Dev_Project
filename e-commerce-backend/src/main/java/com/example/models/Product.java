package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "name", length = 80, nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

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

    @OneToMany(mappedBy = "product")
    private List<ProductImage> images;

    @OneToMany(mappedBy = "product")
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "product")
    private List<Discount> discounts;

    @OneToMany(mappedBy = "product")
    private List<Review> reviews;
}