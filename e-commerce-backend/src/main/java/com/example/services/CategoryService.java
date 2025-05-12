package com.example.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DTO.CategoryDTO;
import com.example.models.Category;
import com.example.repositories.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }
    
    public List<CategoryDTO> findAllAsDTO() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    public Optional<Category> findById(int id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<CategoryDTO> findByIdAsDTO(int id) {
        return categoryRepository.findById(id)
                .map(CategoryDTO::fromEntity);
    }

    public Optional<Category> findBySlug(String slug) {
        return categoryRepository.findBySlug(slug);
    }

    public Optional<CategoryDTO> findBySlugAsDTO(String slug) {
        return categoryRepository.findBySlug(slug)
                .map(CategoryDTO::fromEntity);
    }
    
    public List<Category> findRootCategories() {
        return categoryRepository.findAll().stream()
                .filter(c -> c.getParentCategory() == null)
                .collect(Collectors.toList());
    }
    
    public List<CategoryDTO> findRootCategoriesAsDTO() {
        return findRootCategories().stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Find a category by slug and include its subcategories and products.
     */
    @Transactional(readOnly = true)
    public Optional<CategoryDTO> findBySlugWithSubcategories(String slug) {
        return categoryRepository.findBySlug(slug)
                .map(category -> {
                    CategoryDTO dto = CategoryDTO.fromEntity(category);
                    // Include subcategories
                    if (category.getSubcategories() != null) {
                        dto.setSubcategories(category.getSubcategories().stream()
                                .map(CategoryDTO::fromEntity)
                                .collect(Collectors.toList()));
                    }
                    return dto;
                });
    }

    @Transactional
    public Category create(Category category) {
        // Generate slug if not provided
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        }
        return categoryRepository.save(category);
    }
    
    @Transactional
    public CategoryDTO createFromDTO(CategoryDTO categoryDTO) {
        Category category = categoryDTO.toEntity();
        
        // Set parent category if parentCategoryId is provided
        if (categoryDTO.getParentCategoryId() != null) {
            categoryRepository.findById(categoryDTO.getParentCategoryId())
                    .ifPresent(category::setParentCategory);
        }
        
        // Generate slug if not provided
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        }
        
        Category savedCategory = categoryRepository.save(category);
        return CategoryDTO.fromEntity(savedCategory);
    }

    @Transactional
    public Category update(int id, Category categoryDetails) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Update mutable fields
        existingCategory.setName(categoryDetails.getName());
        
        // Update slug if provided, otherwise generate from name
        if (categoryDetails.getSlug() != null && !categoryDetails.getSlug().isEmpty()) {
            existingCategory.setSlug(categoryDetails.getSlug());
        } else if (!existingCategory.getName().equals(categoryDetails.getName())) {
            existingCategory.setSlug(generateSlug(categoryDetails.getName()));
        }
        
        existingCategory.setImageUrl(categoryDetails.getImageUrl());
        existingCategory.setDescription(categoryDetails.getDescription());
        existingCategory.setActive(categoryDetails.getActive());
        existingCategory.setParentCategory(categoryDetails.getParentCategory());
        
        return categoryRepository.save(existingCategory);
    }
    
    @Transactional
    public CategoryDTO updateFromDTO(int id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
                
        // Update fields from DTO
        existingCategory.setName(categoryDTO.getName());
        
        // Update slug if provided, otherwise generate from name
        if (categoryDTO.getSlug() != null && !categoryDTO.getSlug().isEmpty()) {
            existingCategory.setSlug(categoryDTO.getSlug());
        } else if (!existingCategory.getName().equals(categoryDTO.getName())) {
            existingCategory.setSlug(generateSlug(categoryDTO.getName()));
        }
        
        existingCategory.setImageUrl(categoryDTO.getImageUrl());
        existingCategory.setDescription(categoryDTO.getDescription());
        existingCategory.setActive(categoryDTO.getActive());
        
        // Set parent category if changed
        if (categoryDTO.getParentCategoryId() != null) {
            if (existingCategory.getParentCategory() == null || 
                    existingCategory.getParentCategory().getId() != categoryDTO.getParentCategoryId()) {
                categoryRepository.findById(categoryDTO.getParentCategoryId())
                        .ifPresent(existingCategory::setParentCategory);
            }
        } else {
            existingCategory.setParentCategory(null);
        }
        
        Category updatedCategory = categoryRepository.save(existingCategory);
        return CategoryDTO.fromEntity(updatedCategory);
    }

    @Transactional
    public void delete(int id) {
        categoryRepository.deleteById(id);
    }
    
    // Helper method to generate a URL-friendly slug from a name
    
    @Transactional(readOnly = true)
    public java.util.Set<Integer> getAllDescendantIds(String slug) {
        java.util.Set<Integer> ids = new java.util.HashSet<>();
        Optional<Category> categoryOpt = findBySlug(slug);
        if (categoryOpt.isPresent()) {
            collectDescendantIds(categoryOpt.get(), ids);
        }
        return ids;
    }

    @Transactional(readOnly = true)
    public Optional<CategoryDTO> findByNameAsDTO(String categoryName) {
        // The categoryName parameter from the URL will be URL-decoded by Spring MVC
        // e.g., "Living%20Room%20Furniture" becomes "Living Room Furniture"
        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(categoryName);
        
        // Prioritize exact match on name
        return categories.stream()
                .filter(c -> c.getName().equalsIgnoreCase(categoryName))
                .findFirst()
                .map(CategoryDTO::fromEntity);
    }

    private void collectDescendantIds(Category category, java.util.Set<Integer> ids) {
        ids.add(category.getId());
        if (category.getSubcategories() != null) {
            for (Category subCategory : category.getSubcategories()) {
                collectDescendantIds(subCategory, ids);
            }
        }
    }

    private String generateSlug(String name) {
        if (name == null || name.isEmpty()) {
            return "";
        }
        
        // Convert to lowercase and replace spaces with hyphens
        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "") // Remove special characters
                .replaceAll("\\s+", "-")       // Replace spaces with hyphens
                .replaceAll("-+", "-")         // Replace multiple hyphens with single hyphen
                .trim();
                
        return slug;
    }

}