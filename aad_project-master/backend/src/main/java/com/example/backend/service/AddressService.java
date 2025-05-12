package com.example.backend.service;

import com.example.backend.dto.AddressDTO;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AddressService {
    // Get all addresses for a user
    List<AddressDTO> findByUserId(Long userId);
    List<AddressDTO> findByAuthentication(Authentication authentication);
    
    // Get a specific address
    AddressDTO findById(Long id);
    
    // CRUD operations
    AddressDTO create(AddressDTO addressDTO, Authentication authentication);
    AddressDTO update(Long id, AddressDTO addressDTO, Authentication authentication);
    void delete(Long id, Authentication authentication);
    
    // Set an address as primary
    AddressDTO setPrimary(Long id, Authentication authentication);
} 