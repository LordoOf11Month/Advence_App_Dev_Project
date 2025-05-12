package com.example.backend.service.impl;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
    
    @Override
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
    
    @Override
    public UserDTO findDTOById(Long id) {
        User user = findById(id);
        return mapUserToDTO(user);
    }
    
    @Override
    public UserDTO register(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new BadRequestException("Email is already taken");
        }
        
        // Validate required fields
        if (userDTO.getName() == null || userDTO.getName().trim().isEmpty()) {
            throw new BadRequestException("Name is required");
        }
        
        if (userDTO.getEmail() == null || userDTO.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        
        if (userDTO.getPassword() == null || userDTO.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Password is required");
        }
        
        User user = new User();
        user.setName(userDTO.getName());
        user.setSurname(userDTO.getSurname());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        
        // Default role is CUSTOMER
        Role role = Role.CUSTOMER;
        if (userDTO.getRole() != null) {
            try {
                role = Role.valueOf(userDTO.getRole());
                
                // Additional validation for seller accounts
                if (role == Role.SELLER) {
                    validateSellerRegistration(userDTO);
                }
                
                // Platform admin role cannot be self-assigned
                if (role == Role.PLATFORM_ADMIN) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth == null || !((User) auth.getPrincipal()).getRole().equals(Role.PLATFORM_ADMIN)) {
                        role = Role.CUSTOMER; // Downgrade to customer if not authorized
                    }
                }
            } catch (IllegalArgumentException e) {
                // If role is invalid, default to CUSTOMER
                role = Role.CUSTOMER;
            }
        }
        user.setRole(role);
        
        User savedUser = userRepository.save(user);
        
        return mapUserToDTO(savedUser);
    }
    
    private void validateSellerRegistration(UserDTO userDTO) {
        // Add seller-specific validation logic here
        if (userDTO.getSurname() == null || userDTO.getSurname().trim().isEmpty()) {
            throw new BadRequestException("Surname is required for seller accounts");
        }
        
        // You could add more validation for sellers here
        // For example, check business information, validate tax IDs, etc.
    }
    
    @Override
    public UserDTO update(Long id, UserDTO userDTO) {
        User user = findById(id);
        
        if (userDTO.getName() != null) {
            user.setName(userDTO.getName());
        }
        
        if (userDTO.getSurname() != null) {
            user.setSurname(userDTO.getSurname());
        }
        
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        
        return mapUserToDTO(updatedUser);
    }
    
    @Override
    public void delete(Long id) {
        User user = findById(id);
        userRepository.delete(user);
    }
    
    @Override
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        User user = (User) authentication.getPrincipal();
        return mapUserToDTO(user);
    }
    
    @Override
    public List<UserDTO> findAll() {
        return userRepository.findAll().stream()
                .map(this::mapUserToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public UserDTO mapUserToDTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setSurname(user.getSurname());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole().name());
        userDTO.setBanned(user.isBanned());
        // Don't set the password
        return userDTO;
    }
    
    @Override
    public UserDTO findByAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }
        
        User user = (User) authentication.getPrincipal();
        return mapUserToDTO(user);
    }
    
    @Override
    @Transactional
    public UserDTO updateProfile(UserDTO userDTO, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Only update allowed fields (not allowing role changes or other sensitive data)
        if (userDTO.getName() != null) {
            currentUser.setName(userDTO.getName());
        }
        
        if (userDTO.getSurname() != null) {
            currentUser.setSurname(userDTO.getSurname());
        }
        
        // Don't update email as it's a unique identifier
        
        User updatedUser = userRepository.save(currentUser);
        return mapUserToDTO(updatedUser);
    }
    
    @Override
    @Transactional
    public void changePassword(String currentPassword, String newPassword, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        
        // Update to new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Override
    @Transactional
    public UserDTO banUser(Long id, String reason) {
        User user = findById(id);
        
        user.setBanned(true);
        user.setBannedAt(LocalDateTime.now());
        user.setBanReason(reason);
        
        User bannedUser = userRepository.save(user);
        return mapUserToDTO(bannedUser);
    }
    
    @Override
    @Transactional
    public UserDTO unbanUser(Long id) {
        User user = findById(id);
        
        user.setBanned(false);
        user.setBannedAt(null);
        user.setBanReason(null);
        
        User unbannedUser = userRepository.save(user);
        return mapUserToDTO(unbannedUser);
    }
    
    @Override
    public Map<String, Object> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalSellers = userRepository.countByRole(Role.SELLER);
        long totalAdmins = userRepository.countByRole(Role.PLATFORM_ADMIN);
        long bannedUsers = userRepository.countByIsBannedTrue();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalSellers", totalSellers);
        stats.put("totalAdmins", totalAdmins);
        stats.put("bannedUsers", bannedUsers);
        
        return stats;
    }
} 