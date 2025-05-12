package com.example.backend.service;

import com.example.backend.dto.StoreDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface StoreService {
    // Get all stores
    List<StoreDTO> findAll();
    
    // Get store by ID
    StoreDTO findById(Long id);
    
    // Get stores for current seller
    List<StoreDTO> findByAuthentication(Authentication authentication);
    
    // Create store
    StoreDTO create(StoreDTO storeDTO, Authentication authentication);
    
    // Update store
    StoreDTO update(Long id, StoreDTO storeDTO, Authentication authentication);
    
    // Delete store
    void delete(Long id, Authentication authentication);
} 