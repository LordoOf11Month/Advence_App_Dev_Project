package com.example.repositories;

import com.example.models.Refund;
import com.example.repositories.generic.GenericRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefundRepository extends GenericRepository<Refund, Long> {
    Optional<Refund> findByOrderItem_OrderItemId(Long orderItemId);
    
    @Query("SELECT r FROM Refund r WHERE r.orderItem.orderItemId = :orderItemId AND r.status = 'PENDING'")
    Optional<Refund> findPendingRefundByOrderItemId(@Param("orderItemId") Long orderItemId);
} 