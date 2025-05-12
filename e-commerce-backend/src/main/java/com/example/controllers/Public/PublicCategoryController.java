package com.example.controllers.Public;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.CategoryDTO;
import com.example.models.Category;
import com.example.services.CategoryService;

@RestController
@RequestMapping("/api/public/categories")
public class PublicCategoryController {

    private final CategoryService categoryService;

    public PublicCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.findAllAsDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable int id) {
        return categoryService.findByIdAsDTO(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/root")
    public ResponseEntity<List<CategoryDTO>> getRootCategories() {
        return ResponseEntity.ok(categoryService.findRootCategoriesAsDTO());
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<CategoryDTO>> getSubcategories(@PathVariable int id) {
        Optional<Category> categoryOpt = categoryService.findById(id);
        if (categoryOpt.isPresent()) {
            List<CategoryDTO> subcategories = categoryOpt.get().getSubcategories().stream()
                    .map(CategoryDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(subcategories);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/with-products")
    public ResponseEntity<List<CategoryDTO>> getCategoriesWithProducts() {
        List<Category> categories = categoryService.findAll();
        List<CategoryDTO> categoriesWithProducts = categories.stream()
                .filter(category -> category.getProducts() != null && !category.getProducts().isEmpty())
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoriesWithProducts);
    }
    
    @GetMapping("/by-slug/{slug}")
    public ResponseEntity<CategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        return categoryService.findBySlugAsDTO(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a category by slug with its subcategories and products.
     */
    @GetMapping("/by-slug/{slug}/with-subcategories")
    public ResponseEntity<CategoryDTO> getCategoryBySlugWithSubcategories(@PathVariable String slug) {
        return categoryService.findBySlugWithSubcategories(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search categories by name or description.
     */
    @GetMapping("/search")
    public ResponseEntity<List<CategoryDTO>> searchCategories(@RequestParam(required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Category> categories = categoryService.findAll().stream()
                .filter(category -> 
                    category.getName().toLowerCase().contains(query.toLowerCase()) ||
                    (category.getDescription() != null && 
                     category.getDescription().toLowerCase().contains(query.toLowerCase())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(CategoryDTO.fromEntities(categories));
    }

    @GetMapping("/by-name")
    public ResponseEntity<CategoryDTO> getCategoryByName(@RequestParam String name) {
        return categoryService.findByNameAsDTO(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
