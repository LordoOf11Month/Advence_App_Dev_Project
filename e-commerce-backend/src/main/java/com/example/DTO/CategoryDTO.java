package com.example.DTO;

import com.example.models.Category;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private int id;
    private String name;
    private String slug;
    private String imageUrl;
    private String description;
    private Boolean active;
    private Integer parentCategoryId;
    private List<CategoryDTO> subcategories = new ArrayList<>();

    // Constructor to convert Entity to DTO - without subcategories to prevent recursion
    public CategoryDTO(Category category, boolean includeSubcategories) {
        this.id = category.getId();
        this.name = category.getName();
        this.slug = category.getSlug();
        this.imageUrl = category.getImageUrl();
        this.description = category.getDescription();
        this.active = category.getActive();
        
        if (category.getParentCategory() != null) {
            this.parentCategoryId = category.getParentCategory().getId();
        }
        
        if (includeSubcategories && category.getSubcategories() != null) {
            this.subcategories = category.getSubcategories().stream()
                .map(subcat -> new CategoryDTO(subcat, false)) // Set false to prevent infinite recursion
                .collect(Collectors.toList());
        }
    }
    
    // Utility method to convert Entity to DTO
    public static CategoryDTO fromEntity(Category category) {
        return new CategoryDTO(category, true);
    }
    
    // Utility method to convert list of Entities to list of DTOs
    public static List<CategoryDTO> fromEntities(List<Category> categories) {
        return categories.stream()
            .map(category -> fromEntity(category))
            .collect(Collectors.toList());
    }
    
    // Convert DTO to Entity
    public Category toEntity() {
        Category category = new Category();
        category.setId(this.id);
        category.setName(this.name);
        category.setSlug(this.slug);
        category.setImageUrl(this.imageUrl);
        category.setDescription(this.description);
        category.setActive(this.active);
        return category;
    }
}
