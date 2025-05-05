package com.example.services;

import com.example.DTO.UserDTO.BanRequest;
import com.example.DTO.UserDTO.UpdateUserRequest;
import com.example.DTO.UserDTO.UserResponse;
import com.example.models.User;
import com.example.models.User.Role;
import com.example.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserResponse getCurrentUser() {
        // TODO: Replace with authenticated user retrieval logic
        User user = userRepository.findById(1).orElseThrow();
        return mapToDTO(user);
    }

    public UserResponse getUserById(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return mapToDTO(user);
    }

    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        // TODO: Replace with authenticated user retrieval logic
        User user = userRepository.findById(1).orElseThrow();
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

    private void applyUpdates(User user, UpdateUserRequest request) {
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getRole() != null) user.setRole(Role.valueOf(request.getRole()));
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        // Note: isBanned and banReason are handled elsewhere (ban/unban methods)
    }

    private UserResponse mapToDTO(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setStripeCustomerId(user.getStripeCustomerId());
        dto.setIsBanned(user.getIsBanned());
        dto.setBannedAt(user.getBannedAt());
        dto.setBanReason(user.getBanReason());
        dto.setAvatarUrl(user.getAvatarUrl());
        return dto;
    }
}