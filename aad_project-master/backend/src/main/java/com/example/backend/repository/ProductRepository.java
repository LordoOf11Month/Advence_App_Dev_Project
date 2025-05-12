package com.example.backend.repository;

import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import com.example.backend.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStore(Store store);
    List<Product> findByCategory(Category category);
    List<Product> findByNameContainingIgnoreCase(String keyword);
    
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> search(String keyword);
} 