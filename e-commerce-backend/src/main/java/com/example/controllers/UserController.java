package com.example.controllers;

import com.example.DTOs.UserDTO;
import com.example.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // GET / - List all users (ADMIN only)
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /me - Get current user’s profile
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    // GET /{userId} - Get any user’s details (ADMIN only)
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable int userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    // PUT /me - Update own profile
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateCurrentUser(userDTO));
    }

    // PUT /{userId} - Update user (ADMIN or self)
    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable int userId, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(userId, userDTO));
    }

    // DELETE /{userId} - Delete user (ADMIN only)
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable int userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // POST /{userId}/ban - Ban a user (ADMIN only)
    @PostMapping("/{userId}/ban")
    public ResponseEntity<Void> banUser(@PathVariable int userId, @RequestBody String reason) {
        userService.banUser(userId, reason);
        return ResponseEntity.noContent().build();
    }

    // POST /{userId}/unban - Unban a user (ADMIN only)
    @PostMapping("/{userId}/unban")
    public ResponseEntity<Void> unbanUser(@PathVariable int userId) {
        userService.unbanUser(userId);
        return ResponseEntity.noContent().build();
    }
}