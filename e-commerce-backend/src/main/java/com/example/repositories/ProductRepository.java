package com.example.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.models.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> , JpaSpecificationExecutor<Product>{
    List<Product> findByStore_Id(Long storeId);

    @Query("SELECT p FROM Product p JOIN p.store s WHERE s.seller.id = :sellerId")
    List<Product> findLowStockProductsBySellerId(int sellerId);

    @Query()
    List<Product> findByCategory_Id(int categoryId);

}