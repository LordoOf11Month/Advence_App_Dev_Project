package com.example.services;

import com.example.DTOs.UserDTO;
import com.example.models.User;
import com.example.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserDTO getCurrentUser() {
        // Logic to fetch the currently authenticated user
        User user = userRepository.findById(1).orElseThrow(); // Replace with actual logic
        return mapToDTO(user);
    }

    public UserDTO getUserById(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return mapToDTO(user);
    }

    public UserDTO updateCurrentUser(UserDTO userDTO) {
        // Logic to update the currently authenticated user
        User user = userRepository.findById(1).orElseThrow(); // Replace with actual logic
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        userRepository.save(user);
        return mapToDTO(user);
    }

    public UserDTO updateUser(int userId, UserDTO userDTO) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        userRepository.save(user);
        return mapToDTO(user);
    }

    public void deleteUser(int userId) {
        userRepository.deleteById(userId);
    }

    public void banUser(int userId, String reason) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsBanned(true);
        user.setBanReason(reason);
        userRepository.save(user);
    }

    public void unbanUser(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setIsBanned(false);
        user.setBanReason(null);
        userRepository.save(user);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setBanned(user.getIsBanned());
        dto.setBanReason(user.getBanReason());
        return dto;
    }
}
