package com.example.DTO;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.example.models.Category;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private List<CategoryDTO> subcategories;

    public static CategoryDTO fromEntity(Category category) {
        if (category == null) return null;

        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setImageUrl(category.getImageUrl());
        dto.setDescription(category.getDescription());
        dto.setActive(category.getActive());

        if (category.getParentCategory() != null) {
            dto.setParentCategoryId(category.getParentCategory().getId());
        }

        if (category.getSubcategories() != null) {
            dto.setSubcategories(category.getSubcategories().stream()
                    .map(CategoryDTO::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Category toEntity() {
        Category category = new Category();
        category.setId(this.getId());
        category.setName(this.getName());
        category.setSlug(this.getSlug());
        category.setImageUrl(this.getImageUrl());
        category.setDescription(this.getDescription());
        category.setActive(this.getActive());
        return category;
    }

    public static List<CategoryDTO> fromEntities(List<Category> categories) {
        if (categories == null) return new ArrayList<>();
        return categories.stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
