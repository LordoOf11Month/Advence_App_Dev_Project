package com.example.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;



@Entity
@Table(name = "banners")
@Getter @Setter
public class Banner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false)
    @Future(message = "Finish date must be in the future")
    private LocalDate finishDate;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Title is required")
    private String title;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @OneToMany(mappedBy = "banner")
    private List<Discount> discounts;
}