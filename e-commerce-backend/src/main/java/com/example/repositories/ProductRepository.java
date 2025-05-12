package com.example.repositories;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.models.Product;
import com.example.repositories.generic.GenericRepository;

@Repository
public interface ProductRepository extends GenericRepository<Product, Long> {
    List<Product> findByStore_Id(Long storeId);
    Page<Product> findByStore_Id(Long storeId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.store.id = :storeId")
    List<Product> findByStoreIdWithImagesAndCategory(@Param("storeId") Long storeId);

    @Query("SELECT p FROM Product p JOIN p.store s WHERE s.seller.id = :sellerId")
    List<Product> findLowStockProductsBySellerId(int sellerId);

    // Updated to support pagination and Integer parameter
    @Cacheable(value = "products", key = "#categoryId")
    Page<Product> findByCategory_Id(Integer categoryId, Pageable pageable);
    
    // Method to find products by category ID without pagination
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.category.id = :categoryId AND p.category IS NOT NULL")
    @Cacheable(value = "products", key = "#categoryId")
    List<Product> findByCategoryId(@Param("categoryId") Integer categoryId);
    
    // Method to find products by category slug with improved query
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.category.slug = :slug AND p.category IS NOT NULL")
    @Cacheable(value = "products", key = "#slug")
    List<Product> findByCategorySlug(@Param("slug") String slug);
    
    // This method will be replaced by a combination of CategoryService.getAllDescendantIds and a new findByCategoryIdsIn method.
    // @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category c " +
    //        "WHERE c.slug = :slug " +
    //        "OR c.parentCategory.slug = :slug " +
    //        "OR EXISTS (SELECT 1 FROM Category sub WHERE sub.slug = :slug AND sub.id = c.parentCategory.id)")
    // @Cacheable(value = "products", key = "#slug + '_with_subcategories'")
    // List<Product> findByCategorySlugWithSubcategories(@Param("slug") String slug);

    // New method to find products by a list of category IDs
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category c WHERE c.id IN :categoryIds")
    List<Product> findByCategoryIdsIn(@Param("categoryIds") Set<Integer> categoryIds);
    
    // Added method for text search with pagination
    Page<Product> findByNameContainingOrDescriptionContaining(String name, String description, Pageable pageable);
    
    // Method for text search without pagination
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.category.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchByKeyword(@Param("query") String query);
    
    // New method to search products by both category and keyword with subcategories
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category c " +
           "WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (c.slug = :categorySlug " +
           "OR c.parentCategory.slug = :categorySlug " +
           "OR EXISTS (SELECT 1 FROM Category sub WHERE sub.parentCategory.slug = :categorySlug AND sub.id = c.id) " +
           "OR EXISTS (SELECT 1 FROM Category sub WHERE sub.slug = :categorySlug AND c.parentCategory.id = sub.id) " +
           "OR EXISTS (SELECT 1 FROM Category sub WHERE sub.parentCategory.slug = :categorySlug AND c.parentCategory.id = sub.id))")
    List<Product> searchByCategoryAndKeyword(@Param("categorySlug") String categorySlug, @Param("keyword") String keyword);

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

    // Enhanced search method with pagination
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.category.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Product> searchByKeywordWithPagination(@Param("query") String query, Pageable pageable);

    // Find products by multiple category IDs
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.category.id IN :categoryIds")
    List<Product> findByCategoryIdIn(@Param("categoryIds") List<Integer> categoryIds);
}