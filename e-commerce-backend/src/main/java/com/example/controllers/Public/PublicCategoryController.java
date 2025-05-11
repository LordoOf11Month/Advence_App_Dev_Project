package com.example.controllers.Public;

import com.example.DTO.CategoryDTO;
import com.example.models.Category;
import com.example.services.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/categories")
@CrossOrigin(origins = "*")
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
        // Find the category with the given slug
        Optional<Category> categoryOpt = categoryService.findAll().stream()
                .filter(category -> slug.equals(category.getSlug()))
                .findFirst();
                
        return categoryOpt.map(category -> ResponseEntity.ok(CategoryDTO.fromEntity(category)))
                .orElse(ResponseEntity.notFound().build());
    }
}
