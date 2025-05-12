package com.example.backend.repository;

import com.example.backend.entity.Shipment;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    List<Shipment> findBySeller(User seller);
    List<Shipment> findByOrder_User(User user);
} 