package com.example.repository;

import com.example.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStore_StoreId(Long storeId);
    List<Product> findByCategory_CategoryId(Long categoryId);
    List<Product> findByBrand(String brand);
}