package com.example.repositories;

import com.example.models.Product;
import com.example.repositories.generic.GenericRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends GenericRepository<Product, Long> {
    List<Product> findByStore_Id(Long storeId);
    Page<Product> findByStore_Id(Long storeId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.store.id = :storeId")
    List<Product> findByStoreIdWithImagesAndCategory(@Param("storeId") Long storeId);

    @Query("SELECT p FROM Product p JOIN p.store s WHERE s.seller.id = :sellerId")
    List<Product> findLowStockProductsBySellerId(int sellerId);

    // Updated to support pagination and Long parameter
    Page<Product> findByCategory_Id(Long categoryId, Pageable pageable);
    
    // Method to find products by category ID without pagination
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.category.id = :categoryId")
    List<Product> findByCategoryId(@Param("categoryId") Long categoryId);
    
    // Method to find products by category slug
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.category.slug = :slug")
    List<Product> findByCategorySlug(@Param("slug") String slug);
    
    // Added method for text search with pagination
    Page<Product> findByNameContainingOrDescriptionContaining(String name, String description, Pageable pageable);
    
    // Method for text search without pagination
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.name LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Product> searchByKeyword(@Param("keyword") String keyword);
    
    // Method to broadly search for products by category name, handling variations
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category " +
           "WHERE LOWER(p.category.name) LIKE LOWER(CONCAT('%', :categoryName, '%')) " +
           "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :categoryName, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :categoryName, '%'))")
    List<Product> findByCategoryNameBroad(@Param("categoryName") String categoryName);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.id = :id")
    Optional<Product> findByIdWithImages(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category")
    List<Product> findAllWithImages();

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.store.id = :storeId")
    Page<Product> findByStoreIdWithImagesAndCategory(@Param("storeId") Long storeId, Pageable pageable);
}