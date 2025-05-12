package com.example.backend.service;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface UserService {
    User findByEmail(String email);
    User findById(Long id);
    UserDTO findDTOById(Long id);
    UserDTO register(UserDTO userDTO);
    UserDTO update(Long id, UserDTO userDTO);
    void delete(Long id);
    UserDTO getCurrentUser();
    List<UserDTO> findAll();
    UserDTO mapUserToDTO(User user);
    
    UserDTO findByAuthentication(Authentication authentication);
    UserDTO updateProfile(UserDTO userDTO, Authentication authentication);
    void changePassword(String currentPassword, String newPassword, Authentication authentication);
    
    UserDTO banUser(Long id, String reason);
    UserDTO unbanUser(Long id);
    Map<String, Object> getSystemStats();
} 