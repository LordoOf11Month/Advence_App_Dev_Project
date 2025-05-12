package com.example.repositories;

import com.example.models.PaymentMethod;
import com.example.models.User;
import com.example.repositories.generic.GenericRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentMethodRepository extends GenericRepository<PaymentMethod, String> {
    List<PaymentMethod> findByUser(User user);
    long countByUser(User user);
    List<PaymentMethod> findByUserAndStripePaymentMethodIdNot(User user, String stripePaymentMethodId);
}