package com.example.services;

import com.example.DTO.UserDTO.BanRequest;
import com.example.DTO.UserDTO.UpdateUserRequest;
import com.example.DTO.UserDTO.UserResponse;
import com.example.models.User;
import com.example.models.User.Role;
import com.example.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserResponse getCurrentUser() {
        // Get the authentication object from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Assuming your Authentication object contains the username or a UserDetails object
        String username = authentication.getName(); // Or retrieve a custom UserDetails object

        // Find the user by their unique identifier (e.g., email or username)
        User user = userRepository.findByEmail(username) // You might need a findByEmail method in your repository
                .orElseThrow(() -> new UsernameNotFoundException("User not found")); // Handle case where user isn't found

        return mapToDTO(user);
    }

    public UserResponse getUserById(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return mapToDTO(user);
    }

    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("User not found with email: " + email));
        applyUpdates(user, request);
        userRepository.save(user);
        return mapToDTO(user);
    }

    public UserResponse updateUser(int userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        applyUpdates(user, request);
        userRepository.save(user);
        return mapToDTO(user);
    }

    public void deleteUser(int userId) {
        userRepository.deleteById(userId);
    }

    public void banUser(int userId, BanRequest banRequest) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsBanned(true);
        user.setBanReason(banRequest != null ? banRequest.getBanReason() : null);
        user.setBannedAt(java.time.OffsetDateTime.now());
        userRepository.save(user);
    }

    public void unbanUser(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsBanned(false);
        user.setBanReason(null);
        user.setBannedAt(null);
        userRepository.save(user);
    }

    public UserResponse toggleBan(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (Boolean.TRUE.equals(user.getIsBanned())) {
            unbanUser(userId);
        } else {
            banUser(userId, null);
        }
        user = userRepository.findById(userId).orElseThrow();
        return mapToDTO(user);
    }

    @Transactional
    public void updatePassword(String currentPassword, String newPassword) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private void applyUpdates(User user, UpdateUserRequest request) {
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getRole() != null) {
            user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
    }

    private UserResponse mapToDTO(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name().toLowerCase());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setStripeCustomerId(user.getStripeCustomerId());
        dto.setIsBanned(user.getIsBanned());
        dto.setBannedAt(user.getBannedAt());
        dto.setBanReason(user.getBanReason());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
}