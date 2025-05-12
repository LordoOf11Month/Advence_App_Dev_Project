package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.StoreDTO;
import com.example.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreDTO>>> getAllStores() {
        List<StoreDTO> stores = storeService.findAll();
        return ResponseEntity.ok(ApiResponse.success("Stores retrieved successfully", stores));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StoreDTO>> getStoreById(@PathVariable Long id) {
        StoreDTO store = storeService.findById(id);
        return ResponseEntity.ok(ApiResponse.success("Store retrieved successfully", store));
    }
} 