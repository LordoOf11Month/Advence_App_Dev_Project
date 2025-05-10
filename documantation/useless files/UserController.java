package com.example.controllers;

import com.example.DTO.UserDTO.UpdateUserRequest;
import com.example.DTO.UserDTO.UserResponse;
import com.example.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        int id = Integer.parseInt(userId);
        return ResponseEntity.ok(userService.getUserById(id));
    }


    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid @RequestBody UpdateUserRequest updateUserRequest) {
        return ResponseEntity.ok(userService.updateCurrentUser(updateUserRequest));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String userId, @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        int id = Integer.parseInt(userId);
        return ResponseEntity.ok(userService.updateUser(id, updateUserRequest));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        int id = Integer.parseInt(userId);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/ban")
    public ResponseEntity<UserResponse> banToggle(@PathVariable String id) {
        int userId = Integer.parseInt(id);
        return ResponseEntity.ok(userService.toggleBan(userId));
    }
}