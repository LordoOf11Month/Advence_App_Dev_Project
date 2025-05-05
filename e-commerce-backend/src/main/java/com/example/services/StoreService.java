package com.example.services;

import com.example.DTO.StoreDTO.*;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StoreService {
    public List<StoreResponse> findAll() {
        //later 
        return null;
    }

    public StoreResponse findById(Long id) {
    return null;
    }

    public List<StoreResponse> findByOwner(Long userId) {
    return null;
    }

    public StoreResponse create(@Valid StoreCreateRequest dto) {
    return null;}

    public StoreResponse update(Long id, @Valid StoreUpdateRequest dto) {
    return null;}

    public void delete(Long id) {
    }
}
