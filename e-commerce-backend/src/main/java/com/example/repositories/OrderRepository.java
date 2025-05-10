package com.example.repositories;

// import org.springframework.data.jpa.repository.JpaRepository; // No longer directly needed
import com.example.repositories.generic.GenericRepository; // Import GenericRepository
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.models.OrderEntity;
import com.example.models.OrderItem;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends GenericRepository<OrderEntity, Long> { // Extend GenericRepository
    List<OrderEntity> findByUser_Id(int userId);

    @Query("SELECT o FROM OrderEntity o JOIN o.orderItems oi JOIN oi.product p JOIN p.store s WHERE s.seller.id = :sellerId ORDER BY o.createdAt DESC")
    List<OrderEntity> findBySellerIdOrderByCreatedAtDesc(@Param("sellerId") int sellerId);
    @Query("SELECT o FROM OrderEntity o JOIN o.orderItems oi JOIN oi.product p JOIN p.store s WHERE s.seller.id = :sellerId")
    List<OrderEntity> findOrdersBySellerId(@Param("sellerId") int sellerId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.orderItemId = :orderItemId")
    Optional<OrderItem> findOrderItemById(@Param("orderItemId") Long orderItemId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.stripePaymentIntentId = :paymentIntentId")
    Optional<OrderItem> findByStripePaymentIntentId(@Param("paymentIntentId") String paymentIntentId);
}