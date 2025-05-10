package com.example.repositories;

import com.example.models.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    Optional<Refund> findByOrderItem_OrderItemId(Long orderItemId);
    Optional<Refund> findPendingRefundByOrderItemId(Long orderItemId);
    List<Refund> findByOrderItem_Order_User_Id(Integer userId);
    List<Refund> findByOrderItem_Order_Id(Long orderId);
} 