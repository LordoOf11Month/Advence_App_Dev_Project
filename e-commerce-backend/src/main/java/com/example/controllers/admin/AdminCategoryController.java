package com.example.controllers.admin;

import com.example.DTO.CategoryDTO;
import com.example.models.Category;
import com.example.services.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        List<CategoryDTO> categoryDTOs = categories.stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable int id) {
        return categoryService.findByIdAsDTO(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO createdCategory = categoryService.createFromDTO(categoryDTO);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable int id, @RequestBody CategoryDTO categoryDTO) {
        try {
            CategoryDTO updatedCategory = categoryService.updateFromDTO(id, categoryDTO);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable int id) {
        Optional<Category> category = categoryService.findById(id);
        if (category.isPresent()) {
            // Check if category has subcategories
            if (category.get().getSubcategories() != null && !category.get().getSubcategories().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Cannot delete a category with subcategories
            }
            
            // Check if category has products
            if (category.get().getProducts() != null && !category.get().getProducts().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Cannot delete a category with products
            }
            
            categoryService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/stats")
    public ResponseEntity<List<Object[]>> getCategoryStats() {
        List<Category> categories = categoryService.findAll();
        List<Object[]> stats = categories.stream()
                .map(category -> new Object[]{
                    category.getId(),
                    category.getName(),
                    category.getProducts() != null ? category.getProducts().size() : 0
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(stats);
    }
    
    @PutMapping("/{id}/active")
    public ResponseEntity<CategoryDTO> toggleCategoryActive(@PathVariable int id, @RequestBody boolean active) {
        try {
            Optional<Category> categoryOpt = categoryService.findById(id);
            if (categoryOpt.isPresent()) {
                Category category = categoryOpt.get();
                category.setActive(active);
                Category updatedCategory = categoryService.update(id, category);
                return ResponseEntity.ok(CategoryDTO.fromEntity(updatedCategory));
            }
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
