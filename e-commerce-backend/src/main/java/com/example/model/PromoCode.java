package com.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;



@Entity
@Table(name = "promocodes")
@Getter @Setter
public class PromoCode {
    @Id
    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;
}