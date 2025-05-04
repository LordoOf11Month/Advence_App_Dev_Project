package com.example.controllers;

import org.springframework.web.bind.annotation.*;

import com.example.models.LoginRequest;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest) {
        // Implement login logic
        return "Login successful";
    }

    @PostMapping("/register")
    public String register(@RequestBody RegistrationRequest registrationRequest) {
        // Implement registration logic
        return "Registration successful";
    }

    @PostMapping("/logout")
    public String logout() {
        // Implement logout logic
        return "Logout successful";
    }

    @PostMapping("/refresh-token")
    public String refreshToken(@RequestBody String token) {
        // Implement token refresh logic
        return "Token refreshed";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody PasswordResetRequest passwordResetRequest) {
        // Implement password reset logic
        return "Password reset successful";
    }
}