package com.example.services;

import com.example.DTO.StoreDTO.*;
import com.example.models.Address;
import com.example.models.Store;
import com.example.models.User;
import com.example.repositories.StoreRepository;
import com.example.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StoreService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository; // Assuming you have a UserRepository

    public List<StoreResponse> findAll() {
        return storeRepository.findAll()
                .stream()
                .map(this::mapToStoreResponse)
                .collect(Collectors.toList());
    }

    public StoreResponse findById(long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Store not found with id: " + id));
        return mapToStoreResponse(store);
    }

    public List<StoreResponse> findByOwner(int userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        return storeRepository.findBySeller_Id(userId)
                .stream()
                .map(this::mapToStoreResponse)
                .collect(Collectors.toList());
    }

    public StoreResponse create(@Valid StoreCreateRequest dto) {
        Store store = new Store();
        // Assuming sellerId is provided in the DTO
        User seller = userRepository.findById(dto.getSellerId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getSellerId()));
        seller.setRole(User.Role.seller);
        store.setSeller(seller);
        store.setStoreName(dto.getStoreName());
        store.setDescription(dto.getDescription());
        store.setEmail(dto.getEmail());
        // Set other fields from DTO as needed
        store.setStreet(dto.getStreet());
        store.setCity(dto.getCity());
        store.setState(dto.getState());
        store.setPostalCode(dto.getPostalCode());

        Store savedStore = storeRepository.save(store);
        return mapToStoreResponse(savedStore);
    }

    public StoreResponse update(long id, @Valid StoreUpdateRequest dto) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Store not found with id: " + id));

        Optional.ofNullable(dto.getStoreName()).ifPresent(store::setStoreName);
        Optional.ofNullable(dto.getDescription()).ifPresent(store::setDescription);
        Optional.ofNullable(dto.getEmail()).ifPresent(store::setEmail);
        // Update other fields from DTO as needed

        Store updatedStore = storeRepository.save(store);
        return mapToStoreResponse(updatedStore);
    }

    public StoreResponse updateAddress(long id, @Valid AddressUpdateRequest dto) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Store not found with id: " + id));

       store.setStreet(dto.getStreet());
       store.setCity(dto.getCity());
       store.setState(dto.getState());
       store.setPostalCode(dto.getPostalCode());

        Store updatedStore = storeRepository.save(store);
        return mapToStoreResponse(updatedStore);
    }


    public void delete(long id) {
        if (!storeRepository.existsById(id)) {
            throw new EntityNotFoundException("Store not found with id: " + id);
        }
        storeRepository.deleteById(id);
    }

    private StoreResponse mapToStoreResponse(Store store) {
        StoreResponse dto = new StoreResponse();
        dto.setId(store.getId());
        dto.setStoreName(store.getStoreName());
        dto.setDescription(store.getDescription());
        dto.setCreatedAt(store.getCreatedAt());
        dto.setAverageRating(store.getAverageRating());
        dto.setTotalSales(store.getTotalSales());
        dto.setIsBanned(store.getIsBanned());
        dto.setBannedDate(store.getBannedDate());
        dto.setBanReason(store.getBanReason());
        dto.setEmail(store.getEmail());
        // Map Address details to the DTO
        dto.setStreet(store.getStreet());
        dto.setCity(store.getCity());
        dto.setState(store.getState());
        dto.setPostalCode(store.getPostalCode());

        return dto;
    }
}