package com.example.backend.service;

import com.example.backend.dto.PaymentMethodDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface PaymentMethodService {
    // Get user's payment methods
    List<PaymentMethodDTO> findByUserId(Long userId);
    List<PaymentMethodDTO> findByAuthentication(Authentication authentication);
    
    // CRUD operations
    PaymentMethodDTO findById(Long id);
    PaymentMethodDTO create(PaymentMethodDTO paymentMethodDTO, Authentication authentication);
    PaymentMethodDTO update(Long id, PaymentMethodDTO paymentMethodDTO, Authentication authentication);
    void delete(Long id, Authentication authentication);
    
    // Set as primary
    PaymentMethodDTO setPrimary(Long id, Authentication authentication);
} 