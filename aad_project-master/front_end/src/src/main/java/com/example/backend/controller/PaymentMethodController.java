package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PaymentMethodDTO;
import com.example.backend.service.PaymentMethodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {
    
    @Autowired
    private PaymentMethodService paymentMethodService;
    
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PaymentMethodDTO>>> getUserPaymentMethods(Authentication authentication) {
        List<PaymentMethodDTO> paymentMethods = paymentMethodService.findByAuthentication(authentication);
        return ResponseEntity.ok(ApiResponse.success(paymentMethods));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentMethodDTO>> getPaymentMethod(@PathVariable Long id) {
        PaymentMethodDTO paymentMethod = paymentMethodService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(paymentMethod));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentMethodDTO>> createPaymentMethod(
            @RequestBody PaymentMethodDTO paymentMethodDTO,
            Authentication authentication) {
        PaymentMethodDTO createdPaymentMethod = paymentMethodService.create(paymentMethodDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Payment method saved successfully", createdPaymentMethod));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentMethodDTO>> updatePaymentMethod(
            @PathVariable Long id,
            @RequestBody PaymentMethodDTO paymentMethodDTO,
            Authentication authentication) {
        PaymentMethodDTO updatedPaymentMethod = paymentMethodService.update(id, paymentMethodDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Payment method updated successfully", updatedPaymentMethod));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<?>> deletePaymentMethod(
            @PathVariable Long id,
            Authentication authentication) {
        paymentMethodService.delete(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Payment method deleted successfully", null));
    }
    
    @PutMapping("/{id}/primary")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentMethodDTO>> setPaymentMethodAsPrimary(
            @PathVariable Long id,
            Authentication authentication) {
        PaymentMethodDTO primaryPaymentMethod = paymentMethodService.setPrimary(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Payment method set as primary", primaryPaymentMethod));
    }
} 