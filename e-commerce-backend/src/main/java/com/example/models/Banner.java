package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import java.sql.Timestamp;


@Entity
@Table(name = "banners")
@Getter @Setter
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name="start_date", nullable = false)
    private Timestamp startDate;


    @Column(name="finish_date", nullable = false)
    @Future(message = "Finish date must be in the future")
    private LocalDate finishDate;

    @Column(name="title", nullable = false, length = 255)
    @NotBlank(message = "Title is required")
    private String title;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @OneToMany(mappedBy = "banner")
    private List<Discount> discounts;
}