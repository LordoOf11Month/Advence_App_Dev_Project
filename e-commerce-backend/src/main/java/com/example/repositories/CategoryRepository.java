package com.example.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.models.Category;
import com.example.repositories.generic.GenericRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends GenericRepository<Category, Integer> {
    
    // Find a category by its slug
    Optional<Category> findBySlug(String slug);
    
    // Find all root categories (categories without a parent)
    @Query("SELECT c FROM Category c WHERE c.parentCategory IS NULL")
    List<Category> findRootCategories();
    
    // Find all active categories
    List<Category> findByActiveTrue();
    
    // Find subcategories of a specific category
    List<Category> findByParentCategoryId(int parentId);
    
    // Find all categories that have products
    @Query("SELECT DISTINCT c FROM Category c JOIN c.products p")
    List<Category> findAllWithProducts();
    
    // Find categories by name containing keyword
    List<Category> findByNameContainingIgnoreCase(String keyword);
}