package com.example.backend.repository;

import com.example.backend.entity.PaymentMethod;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByUser(User user);
    List<PaymentMethod> findByUserId(Long userId);
    Optional<PaymentMethod> findByUserAndPrimaryIsTrue(User user);
} 