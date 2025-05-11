package com.example.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
@Getter @Setter
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private int id;

    @Column(name = "name", length = 120, nullable = false)
    private String name;
    
    @Column(name = "slug", length = 150, unique = true)
    private String slug;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "is_active")
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_category_id")
    @JsonIgnore // Prevents infinite recursion in JSON serialization
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL)
    private List<Category> subcategories = new ArrayList<>();

    @OneToMany(mappedBy = "category")
    @JsonIgnore // To prevent large response payloads
    private List<Product> products;
    
    // Helper method to add a subcategory
    public void addSubcategory(Category subcategory) {
        subcategories.add(subcategory);
        subcategory.setParentCategory(this);
    }
    
    // Helper method to remove a subcategory
    public void removeSubcategory(Category subcategory) {
        subcategories.remove(subcategory);
        subcategory.setParentCategory(null);
    }
}

