package com.example.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.models.Category;
import com.example.models.SubCategoryRelation;

import java.util.List;

@Repository
public interface SubCategoryRelationRepository extends JpaRepository<SubCategoryRelation, Long> {
    
    // Find all direct subcategories (depth=1) of a given category
    List<SubCategoryRelation> findByAncestorAndDepth(Category ancestor, int depth);
    
    // Find all descendants of a given category (at any depth)
    List<SubCategoryRelation> findByAncestor(Category ancestor);
    
    // Find all ancestors of a given category (at any depth)
    List<SubCategoryRelation> findByDescendant(Category descendant);
    
    // Check if a category is an ancestor of another category
    boolean existsByAncestorAndDescendant(Category ancestor, Category descendant);
    
    // Find the path between two categories
    @Query("SELECT scr FROM SubCategoryRelation scr WHERE scr.ancestor = :ancestor AND scr.descendant = :descendant")
    SubCategoryRelation findPath(@Param("ancestor") Category ancestor, @Param("descendant") Category descendant);
    
    // Delete relations involving a specific category
    void deleteByAncestorOrDescendant(Category category, Category sameCategory);
} 