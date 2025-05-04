package com.example.services;

import com.example.models.Category;
import com.example.repositories.CategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    public Category update(int id, Category categoryDetails) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Update mutable fields
        existingCategory.setName(categoryDetails.getName());
        existingCategory.setParentCategory(categoryDetails.getParentCategory());
        
        return categoryRepository.save(existingCategory);
    }

    public void delete(int id) {
        categoryRepository.deleteById(id);
    }
}