package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
    List<Order> findByUserId(Long id);

    /** CORRECTED: query by shipmentStatus, not status */
    List<Order> findByShipmentStatus(String shipmentStatus);

    List<Order> findByUserOrderByOrderDateDesc(User user);

    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}
