package com.example.services;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.DTO.CategoryDTO;
import com.example.models.Category;
import com.example.repositories.CategoryRepository;
import com.example.models.SubCategoryRelation;
import com.example.repositories.SubCategoryRelationRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRelationService subCategoryRelationService;
    private final SubCategoryRelationRepository relationRepository;

    public CategoryService(CategoryRepository categoryRepository, 
                          SubCategoryRelationService subCategoryRelationService,
                          SubCategoryRelationRepository relationRepository) {
        this.categoryRepository = categoryRepository;
        this.subCategoryRelationService = subCategoryRelationService;
        this.relationRepository = relationRepository;
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
        
        Category savedCategory = categoryRepository.save(category);
        
        // If this category has a parent, establish relationship in subcategory relation table
        if (category.getParentCategory() != null) {
            subCategoryRelationService.addSubcategory(
                category.getParentCategory().getId(), 
                savedCategory.getId()
            );
        } else {
            // For root categories, create a self-relation with depth 0
            SubCategoryRelation selfRelation = new SubCategoryRelation(savedCategory, savedCategory, 0);
            relationRepository.save(selfRelation);
        }
        
        return savedCategory;
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
        
        // Setup hierarchy relationships
        if (categoryDTO.getParentCategoryId() != null) {
            subCategoryRelationService.addSubcategory(
                categoryDTO.getParentCategoryId(), 
                savedCategory.getId()
            );
        } else {
            // For root categories, create a self-relation with depth 0
            subCategoryRelationService.buildRelationship(savedCategory, savedCategory, 0);
        }
        
        return CategoryDTO.fromEntity(savedCategory);
    }

    @Transactional
    public Category update(int id, Category categoryDetails) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
                
        // Check if parent category is changing
        boolean parentCategoryChanged = 
            (existingCategory.getParentCategory() == null && categoryDetails.getParentCategory() != null) ||
            (existingCategory.getParentCategory() != null && categoryDetails.getParentCategory() == null) ||
            (existingCategory.getParentCategory() != null && categoryDetails.getParentCategory() != null && 
             existingCategory.getParentCategory().getId() != categoryDetails.getParentCategory().getId());

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
        
        Category updatedCategory = categoryRepository.save(existingCategory);
        
        // If parent category changed, update the hierarchy relationships
        if (parentCategoryChanged) {
            // Remove all existing relationships
            subCategoryRelationService.removeSubcategoryRelations(updatedCategory);
            
            // Create new relationships based on new parent
            if (updatedCategory.getParentCategory() != null) {
                subCategoryRelationService.addSubcategory(
                    updatedCategory.getParentCategory().getId(),
                    updatedCategory.getId()
                );
            } else {
                // For root categories, create a self-relation with depth 0
                subCategoryRelationService.buildRelationship(updatedCategory, updatedCategory, 0);
            }
        }
        
        return updatedCategory;
    }
    
    @Transactional
    public CategoryDTO updateFromDTO(int id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
                
        // Check if parent category is changing
        Integer currentParentId = existingCategory.getParentCategory() != null ? 
                                  existingCategory.getParentCategory().getId() : null;
        boolean parentCategoryChanged = (currentParentId == null && categoryDTO.getParentCategoryId() != null) ||
                                       (currentParentId != null && categoryDTO.getParentCategoryId() == null) ||
                                       (currentParentId != null && categoryDTO.getParentCategoryId() != null && 
                                        !currentParentId.equals(categoryDTO.getParentCategoryId()));
                
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
        
        // If parent category changed, update the hierarchy relationships
        if (parentCategoryChanged) {
            // Remove all existing relationships
            subCategoryRelationService.removeSubcategoryRelations(updatedCategory);
            
            // Create new relationships based on new parent
            if (categoryDTO.getParentCategoryId() != null) {
                subCategoryRelationService.addSubcategory(
                    categoryDTO.getParentCategoryId(),
                    updatedCategory.getId()
                );
            } else {
                // For root categories, create a self-relation with depth 0
                subCategoryRelationService.buildRelationship(updatedCategory, updatedCategory, 0);
            }
        }
        
        return CategoryDTO.fromEntity(updatedCategory);
    }

    @Transactional
    public void delete(int id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
            
        // First remove all subcategory relationships
        subCategoryRelationService.removeSubcategoryRelations(category);
        
        // Then delete the category
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