package com.example.backend.service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.entity.Category;
import java.util.List;

public interface CategoryService {
    List<CategoryDTO> findAllRoot();
    List<CategoryDTO> findSubcategories(Long parentId);
    CategoryDTO findById(Long id);
    CategoryDTO create(CategoryDTO categoryDTO);
    CategoryDTO update(Long id, CategoryDTO categoryDTO);
    void delete(Long id);
} 