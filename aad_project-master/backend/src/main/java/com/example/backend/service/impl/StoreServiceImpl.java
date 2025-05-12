package com.example.backend.service.impl;

import com.example.backend.dto.StoreDTO;
import com.example.backend.entity.Role;
import com.example.backend.entity.Store;
import com.example.backend.entity.User;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.StoreRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoreServiceImpl implements StoreService {

    @Autowired
    private StoreRepository storeRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public List<StoreDTO> findAll() {
        return storeRepository.findAll().stream()
                .map(this::mapStoreToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public StoreDTO findById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        
        return mapStoreToDTO(store);
    }
    
    @Override
    public List<StoreDTO> findByAuthentication(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Only sellers and admins can access this
        if (user.getRole() != Role.SELLER && user.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("Only sellers can access their stores");
        }
        
        // For admin, can get all stores
        if (user.getRole() == Role.PLATFORM_ADMIN) {
            return findAll();
        }
        
        // For sellers, get only their own stores
        List<Store> stores = storeRepository.findBySeller(user);
        return stores.stream()
                .map(this::mapStoreToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public StoreDTO create(StoreDTO storeDTO, Authentication authentication) {
        User seller = (User) authentication.getPrincipal();
        
        // Verify the user is a seller
        if (seller.getRole() != Role.SELLER && seller.getRole() != Role.PLATFORM_ADMIN) {
            throw new AccessDeniedException("Only sellers can create stores");
        }
        
        // For admin, can create store for any seller
        if (seller.getRole() == Role.PLATFORM_ADMIN && storeDTO.getSellerId() != null) {
            seller = userRepository.findById(storeDTO.getSellerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + storeDTO.getSellerId()));
            
            // Verify the user is a seller
            if (seller.getRole() != Role.SELLER) {
                throw new BadRequestException("Cannot create store for non-seller user");
            }
        }
        
        // Validate store data
        if (storeDTO.getStoreName() == null || storeDTO.getStoreName().trim().isEmpty()) {
            throw new BadRequestException("Store name is required");
        }
        
        // Check if seller already has a store (one seller can have multiple stores)
        List<Store> existingStores = storeRepository.findBySeller(seller);
        
        // Create new store
        Store store = new Store();
        store.setSeller(seller);
        store.setStoreName(storeDTO.getStoreName());
        store.setDescription(storeDTO.getDescription());
        
        Store savedStore = storeRepository.save(store);
        
        return mapStoreToDTO(savedStore);
    }
    
    @Override
    @Transactional
    public StoreDTO update(Long id, StoreDTO storeDTO, Authentication authentication) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Verify ownership or admin rights
        if (user.getRole() != Role.PLATFORM_ADMIN && !store.getSeller().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own stores");
        }
        
        // Update store fields
        if (storeDTO.getStoreName() != null) {
            store.setStoreName(storeDTO.getStoreName());
        }
        
        if (storeDTO.getDescription() != null) {
            store.setDescription(storeDTO.getDescription());
        }
        
        Store updatedStore = storeRepository.save(store);
        
        return mapStoreToDTO(updatedStore);
    }
    
    @Override
    @Transactional
    public void delete(Long id, Authentication authentication) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Verify ownership or admin rights
        if (user.getRole() != Role.PLATFORM_ADMIN && !store.getSeller().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only delete your own stores");
        }
        
        storeRepository.delete(store);
    }
    
    private StoreDTO mapStoreToDTO(Store store) {
        StoreDTO dto = new StoreDTO();
        dto.setId(store.getId());
        dto.setSellerId(store.getSeller().getId());
        dto.setSellerName(store.getSeller().getName() + " " + store.getSeller().getSurname());
        dto.setStoreName(store.getStoreName());
        dto.setDescription(store.getDescription());
        dto.setCreatedAt(store.getCreatedAt());
        
        return dto;
    }
} 