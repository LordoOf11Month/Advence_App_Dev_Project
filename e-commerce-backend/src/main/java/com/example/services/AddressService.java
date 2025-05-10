package com.example.services;

import com.example.DTO.AddressDTO.AddressResponse;
import com.example.DTO.AddressDTO.CreateAddressRequest;
import com.example.DTO.AddressDTO.UpdateAddressRequest;
import com.example.models.Address;
import com.example.models.User;
import com.example.repositories.AddressRepository;
import com.example.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    public List<AddressResponse> getCurrentUserAddresses() {
        User currentUser = getCurrentUser();
        return addressRepository.findByUser(currentUser).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse createAddress(CreateAddressRequest request) {
        User currentUser = getCurrentUser();
        
        Address address = new Address();
        address.setUser(currentUser);
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setCountry(request.getCountry());
        address.setZipCode(request.getZipCode());
        address.setDefault(request.isDefault());

        // If this is set as default, unset any existing default address
        if (request.isDefault()) {
            addressRepository.findByUserAndIsDefaultTrue(currentUser)
                    .ifPresent(existingDefault -> {
                        existingDefault.setDefault(false);
                        addressRepository.save(existingDefault);
                    });
        }

        return convertToDto(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Integer id, UpdateAddressRequest request) {
        User currentUser = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Verify the address belongs to the current user
        if (address.getUser().getId() != currentUser.getId()) {
            throw new RuntimeException("Address does not belong to current user");
        }

        if (request.getStreet() != null) address.setStreet(request.getStreet());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getZipCode() != null) address.setZipCode(request.getZipCode());
        if (request.getIsDefault() != null) {
            address.setDefault(request.getIsDefault());
            // If setting as default, unset any existing default address
            if (request.getIsDefault()) {
                addressRepository.findByUserAndIsDefaultTrue(currentUser)
                        .ifPresent(existingDefault -> {
                            if (existingDefault.getId() != id) {
                                existingDefault.setDefault(false);
                                addressRepository.save(existingDefault);
                            }
                        });
            }
        }

        return convertToDto(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Integer id) {
        User currentUser = getCurrentUser();
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Verify the address belongs to the current user
        if (address.getUser().getId() != currentUser.getId()) {
            throw new RuntimeException("Address does not belong to current user");
        }

        addressRepository.delete(address);
    }

    private AddressResponse convertToDto(Address address) {
        AddressResponse dto = new AddressResponse();
        dto.setId(address.getId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setCountry(address.getCountry());
        dto.setZipCode(address.getZipCode());
        dto.setDefault(address.isDefault());
        return dto;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
} 