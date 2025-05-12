package com.example.backend.service.impl;

import com.example.backend.dto.PaymentMethodDTO;
import com.example.backend.entity.PaymentMethod;
import com.example.backend.entity.User;
import com.example.backend.repository.PaymentMethodRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.PaymentMethodService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Mapping methods
    private PaymentMethodDTO mapToDTO(PaymentMethod paymentMethod) {
        PaymentMethodDTO dto = new PaymentMethodDTO();
        dto.setId(paymentMethod.getId());
        dto.setUserId(paymentMethod.getUser().getId());
        dto.setType(paymentMethod.getType());
        dto.setAccountNumber(paymentMethod.getAccountNumber());
        dto.setCardholderName(paymentMethod.getCardholderName());
        dto.setExpirationMonth(paymentMethod.getExpirationMonth());
        dto.setExpirationYear(paymentMethod.getExpirationYear());
        dto.setNickname(paymentMethod.getNickname());
        dto.setPrimary(paymentMethod.isPrimary());
        return dto;
    }
    
    private PaymentMethod mapToEntity(PaymentMethodDTO dto, User user) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUser(user);
        paymentMethod.setType(dto.getType());
        paymentMethod.setAccountNumber(dto.getAccountNumber());
        paymentMethod.setCardholderName(dto.getCardholderName());
        paymentMethod.setExpirationMonth(dto.getExpirationMonth());
        paymentMethod.setExpirationYear(dto.getExpirationYear());
        paymentMethod.setNickname(dto.getNickname());
        paymentMethod.setPrimary(dto.isPrimary());
        return paymentMethod;
    }
    
    @Override
    public List<PaymentMethodDTO> findByUserId(Long userId) {
        return paymentMethodRepository.findByUserId(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PaymentMethodDTO> findByAuthentication(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return paymentMethodRepository.findByUser(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public PaymentMethodDTO findById(Long id) {
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment method not found"));
        return mapToDTO(paymentMethod);
    }
    
    @Override
    @Transactional
    public PaymentMethodDTO create(PaymentMethodDTO paymentMethodDTO, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // If this is marked as primary, unset any existing primary
        if (paymentMethodDTO.isPrimary()) {
            unsetExistingPrimary(user);
        }
        
        PaymentMethod paymentMethod = mapToEntity(paymentMethodDTO, user);
        PaymentMethod savedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return mapToDTO(savedPaymentMethod);
    }
    
    @Override
    @Transactional
    public PaymentMethodDTO update(Long id, PaymentMethodDTO paymentMethodDTO, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment method not found"));
        
        // Check if the payment method belongs to the authenticated user
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own payment methods");
        }
        
        // If this is marked as primary, unset any existing primary
        if (paymentMethodDTO.isPrimary() && !paymentMethod.isPrimary()) {
            unsetExistingPrimary(user);
        }
        
        // Update fields
        paymentMethod.setType(paymentMethodDTO.getType());
        paymentMethod.setAccountNumber(paymentMethodDTO.getAccountNumber());
        paymentMethod.setCardholderName(paymentMethodDTO.getCardholderName());
        paymentMethod.setExpirationMonth(paymentMethodDTO.getExpirationMonth());
        paymentMethod.setExpirationYear(paymentMethodDTO.getExpirationYear());
        paymentMethod.setNickname(paymentMethodDTO.getNickname());
        paymentMethod.setPrimary(paymentMethodDTO.isPrimary());
        
        PaymentMethod updatedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        return mapToDTO(updatedPaymentMethod);
    }
    
    @Override
    @Transactional
    public void delete(Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment method not found"));
        
        // Check if the payment method belongs to the authenticated user
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only delete your own payment methods");
        }
        
        paymentMethodRepository.delete(paymentMethod);
    }
    
    @Override
    @Transactional
    public PaymentMethodDTO setPrimary(Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        PaymentMethod paymentMethod = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payment method not found"));
        
        // Check if the payment method belongs to the authenticated user
        if (!paymentMethod.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own payment methods");
        }
        
        // Unset any existing primary
        unsetExistingPrimary(user);
        
        // Set this as primary
        paymentMethod.setPrimary(true);
        PaymentMethod updatedPaymentMethod = paymentMethodRepository.save(paymentMethod);
        
        return mapToDTO(updatedPaymentMethod);
    }
    
    private void unsetExistingPrimary(User user) {
        paymentMethodRepository.findByUserAndPrimaryIsTrue(user).ifPresent(existingPrimary -> {
            existingPrimary.setPrimary(false);
            paymentMethodRepository.save(existingPrimary);
        });
    }
} 