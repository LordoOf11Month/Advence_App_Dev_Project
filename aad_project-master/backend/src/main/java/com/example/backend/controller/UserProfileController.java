package com.example.backend.controller;

import com.example.backend.dto.AddressDTO;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.UserDTO;
import com.example.backend.service.AddressService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private AddressService addressService;
    
    // Get user profile
    @GetMapping
    public ResponseEntity<ApiResponse<UserDTO>> getUserProfile(Authentication authentication) {
        UserDTO userProfile = userService.findByAuthentication(authentication);
        return ResponseEntity.ok(ApiResponse.success(userProfile));
    }
    
    // Update user profile
    @PutMapping
    public ResponseEntity<ApiResponse<UserDTO>> updateUserProfile(
            @RequestBody UserDTO userDTO,
            Authentication authentication) {
        UserDTO updatedUser = userService.updateProfile(userDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }
    
    // Change password
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<?>> changePassword(
            @RequestBody Map<String, String> passwordChange,
            Authentication authentication) {
        String currentPassword = passwordChange.get("currentPassword");
        String newPassword = passwordChange.get("newPassword");
        
        userService.changePassword(currentPassword, newPassword, authentication);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
    
    // Address management
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getUserAddresses(Authentication authentication) {
        List<AddressDTO> addresses = addressService.findByAuthentication(authentication);
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }
    
    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDTO>> addAddress(
            @RequestBody AddressDTO addressDTO,
            Authentication authentication) {
        AddressDTO createdAddress = addressService.create(addressDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Address saved successfully", createdAddress));
    }
    
    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressDTO addressDTO,
            Authentication authentication) {
        AddressDTO updatedAddress = addressService.update(id, addressDTO, authentication);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", updatedAddress));
    }
    
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<?>> deleteAddress(
            @PathVariable Long id,
            Authentication authentication) {
        addressService.delete(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
    
    @PutMapping("/addresses/{id}/primary")
    public ResponseEntity<ApiResponse<AddressDTO>> setAddressAsPrimary(
            @PathVariable Long id,
            Authentication authentication) {
        AddressDTO primaryAddress = addressService.setPrimary(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Address set as primary", primaryAddress));
    }
} 