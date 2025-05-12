package com.example.backend.service.impl;

import com.example.backend.dto.AddressDTO;
import com.example.backend.entity.Address;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public List<AddressDTO> findByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return addressRepository.findByUser(user).stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AddressDTO> findByAuthentication(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        return addressRepository.findByUser(user).stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AddressDTO findById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        
        return mapAddressToDTO(address);
    }

    @Override
    @Transactional
    public AddressDTO create(AddressDTO addressDTO, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Address address = new Address();
        address.setUser(user);
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setZipCode(addressDTO.getZipCode());
        address.setCountry(addressDTO.getCountry());
        
        // Check if this is the first address for the user
        List<Address> existingAddresses = addressRepository.findByUser(user);
        if (existingAddresses.isEmpty()) {
            // If it's the first address, make it primary by default
            address.setPrimary(true);
        } else {
            // Otherwise, respect the provided value or default to false
            address.setPrimary(addressDTO.isPrimary());
            
            // If setting this address as primary, unset any existing primary address
            if (address.isPrimary()) {
                existingAddresses.stream()
                        .filter(Address::isPrimary)
                        .forEach(a -> {
                            a.setPrimary(false);
                            addressRepository.save(a);
                        });
            }
        }
        
        Address savedAddress = addressRepository.save(address);
        
        return mapAddressToDTO(savedAddress);
    }

    @Override
    @Transactional
    public AddressDTO update(Long id, AddressDTO addressDTO, Authentication authentication) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Verify ownership
        if (!address.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only update your own addresses");
        }
        
        // Update address fields
        if (addressDTO.getStreet() != null) {
            address.setStreet(addressDTO.getStreet());
        }
        
        if (addressDTO.getCity() != null) {
            address.setCity(addressDTO.getCity());
        }
        
        if (addressDTO.getState() != null) {
            address.setState(addressDTO.getState());
        }
        
        if (addressDTO.getZipCode() != null) {
            address.setZipCode(addressDTO.getZipCode());
        }
        
        if (addressDTO.getCountry() != null) {
            address.setCountry(addressDTO.getCountry());
        }
        
        // If setting this address as primary, unset any existing primary address
        if (addressDTO.isPrimary() && !address.isPrimary()) {
            List<Address> userAddresses = addressRepository.findByUser(user);
            userAddresses.stream()
                    .filter(Address::isPrimary)
                    .forEach(a -> {
                        a.setPrimary(false);
                        addressRepository.save(a);
                    });
            
            address.setPrimary(true);
        }
        
        Address updatedAddress = addressRepository.save(address);
        
        return mapAddressToDTO(updatedAddress);
    }

    @Override
    @Transactional
    public void delete(Long id, Authentication authentication) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Verify ownership
        if (!address.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only delete your own addresses");
        }
        
        // If this was the primary address, designate another one as primary
        if (address.isPrimary()) {
            List<Address> userAddresses = addressRepository.findByUser(user);
            userAddresses.stream()
                    .filter(a -> !a.getId().equals(id))
                    .findFirst()
                    .ifPresent(a -> {
                        a.setPrimary(true);
                        addressRepository.save(a);
                    });
        }
        
        addressRepository.delete(address);
    }

    @Override
    @Transactional
    public AddressDTO setPrimary(Long id, Authentication authentication) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
        
        User user = (User) authentication.getPrincipal();
        
        // Verify ownership
        if (!address.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only modify your own addresses");
        }
        
        // Unset any existing primary address
        List<Address> userAddresses = addressRepository.findByUser(user);
        userAddresses.stream()
                .filter(Address::isPrimary)
                .forEach(a -> {
                    a.setPrimary(false);
                    addressRepository.save(a);
                });
        
        // Set this address as primary
        address.setPrimary(true);
        Address updatedAddress = addressRepository.save(address);
        
        return mapAddressToDTO(updatedAddress);
    }
    
    private AddressDTO mapAddressToDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setUserId(address.getUser().getId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setZipCode(address.getZipCode());
        dto.setCountry(address.getCountry());
        dto.setPrimary(address.isPrimary());
        
        return dto;
    }
} 