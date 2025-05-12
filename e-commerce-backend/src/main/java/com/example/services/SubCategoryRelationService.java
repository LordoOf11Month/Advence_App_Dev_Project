package com.example.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.models.Category;
import com.example.models.SubCategoryRelation;
import com.example.repositories.CategoryRepository;
import com.example.repositories.SubCategoryRelationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SubCategoryRelationService {

    private final SubCategoryRelationRepository relationRepository;
    private final CategoryRepository categoryRepository;

    public SubCategoryRelationService(SubCategoryRelationRepository relationRepository, 
                                     CategoryRepository categoryRepository) {
        this.relationRepository = relationRepository;
        this.categoryRepository = categoryRepository;
    }

    /**
     * Builds a hierarchy relationship between an ancestor and descendant category.
     * Creates a direct relationship (depth=1) if ancestor is the direct parent.
     * Also creates transitive relationships with higher depths.
     */
    @Transactional
    public void buildRelationship(Category ancestor, Category descendant, int depth) {
        // Create direct relationship between ancestor and descendant
        SubCategoryRelation relation = new SubCategoryRelation(ancestor, descendant, depth);
        relationRepository.save(relation);
        
        // If this is a direct parent-child relationship (depth=1),
        // create transitive relationships with ancestor's ancestors
        if (depth == 1) {
            // Find all ancestors of the current ancestor
            List<SubCategoryRelation> ancestorRelations = relationRepository.findByDescendant(ancestor);
            
            // For each of ancestor's ancestors, create a relationship with the descendant
            for (SubCategoryRelation ancestorRel : ancestorRelations) {
                SubCategoryRelation transitiveRelation = new SubCategoryRelation(
                    ancestorRel.getAncestor(),  // The ancestor's ancestor
                    descendant,                // The current descendant
                    ancestorRel.getDepth() + 1  // Increment depth for transitive relationship
                );
                relationRepository.save(transitiveRelation);
            }
        }
    }
    
    /**
     * Sets up all necessary relationships when adding a subcategory to a parent category.
     */
    @Transactional
    public void addSubcategory(int parentId, int childId) {
        Optional<Category> parentOpt = categoryRepository.findById(parentId);
        Optional<Category> childOpt = categoryRepository.findById(childId);
        
        if (parentOpt.isPresent() && childOpt.isPresent()) {
            Category parent = parentOpt.get();
            Category child = childOpt.get();
            
            // Create direct relationship (parent to child, depth 1)
            buildRelationship(parent, child, 1);
            
            // Also add self-relationship for the child (child to child, depth 0)
            SubCategoryRelation selfRelation = new SubCategoryRelation(child, child, 0);
            relationRepository.save(selfRelation);
        } else {
            throw new RuntimeException("Parent or child category not found");
        }
    }
    
    /**
     * Retrieves all direct subcategories of a category.
     */
    public List<SubCategoryRelation> getDirectSubcategories(Category category) {
        return relationRepository.findByAncestorAndDepth(category, 1);
    }
    
    /**
     * Retrieves all subcategories (direct and indirect) of a category.
     */
    public List<SubCategoryRelation> getAllSubcategories(Category category) {
        // Get all relationships where this category is an ancestor, excluding self-relationship
        return relationRepository.findByAncestor(category).stream()
            .filter(rel -> rel.getDepth() > 0)
            .toList();
    }
    
    /**
     * Retrieves all ancestors of a category.
     */
    public List<SubCategoryRelation> getAllAncestors(Category category) {
        // Get all relationships where this category is a descendant, excluding self-relationship
        return relationRepository.findByDescendant(category).stream()
            .filter(rel -> rel.getDepth() > 0)
            .toList();
    }
    
    /**
     * Checks if a category is an ancestor of another category.
     */
    public boolean isAncestorOf(Category ancestor, Category descendant) {
        return relationRepository.existsByAncestorAndDescendant(ancestor, descendant);
    }
    
    /**
     * Removes a subcategory and all its relationships.
     */
    @Transactional
    public void removeSubcategoryRelations(Category category) {
        // Remove all relationships where this category is either ancestor or descendant
        relationRepository.deleteByAncestorOrDescendant(category, category);
    }
} 