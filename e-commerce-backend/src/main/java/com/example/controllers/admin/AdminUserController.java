package com.example.controllers.admin;

import com.example.DTO.UserDTO.UpdateUserRequest;
import com.example.DTO.UserDTO.UserResponse;
import com.example.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Map<String, ?>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        List<Map<String, ?>> simplifiedUsers = users.stream()
            .map(user -> Map.of(
                "id", user.getId(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "isBanned", user.getIsBanned()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(simplifiedUsers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int id) {
        UserResponse user = userService.getUserById(id);
        // Remove sensitive information
        user.setStripeCustomerId(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable int id,
            @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        if (newRole == null) {
            return ResponseEntity.badRequest().build();
        }

        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setRole(newRole);
        
        UserResponse updatedUser = userService.updateUser(id, updateRequest);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/ban")
    public ResponseEntity<UserResponse> banUser(@PathVariable int id) {
        UserResponse user = userService.toggleBan(id);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
} 