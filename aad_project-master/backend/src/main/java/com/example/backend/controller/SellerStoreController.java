package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.StoreDTO;
import com.example.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/stores")
public class SellerStoreController {

    @Autowired
    private StoreService storeService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreDTO>>> getSellerStores(Authentication authentication) {
        List<StoreDTO> stores = storeService.findByAuthentication(authentication);
        return ResponseEntity.ok(ApiResponse.success("Seller stores retrieved successfully", stores));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreDTO>> getStoreById(@PathVariable Long id) {
        StoreDTO store = storeService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Store retrieved successfully", store));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<StoreDTO>> createStore(@RequestBody StoreDTO storeDTO, Authentication authentication) {
        StoreDTO createdStore = storeService.create(storeDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Store created successfully", createdStore));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreDTO>> updateStore(@PathVariable Long id, @RequestBody StoreDTO storeDTO, Authentication authentication) {
        StoreDTO updatedStore = storeService.update(id, storeDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Store updated successfully", updatedStore));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStore(@PathVariable Long id, Authentication authentication) {
        storeService.delete(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Store deleted successfully", null));
    }
} 