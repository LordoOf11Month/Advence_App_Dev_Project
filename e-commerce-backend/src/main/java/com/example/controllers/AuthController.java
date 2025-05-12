package com.example.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.DTO.AuthDTO.JwtResponse;
import com.example.DTO.AuthDTO.LoginRequest;
import com.example.DTO.AuthDTO.RegisterRequest;
import com.example.services.AuthService;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

// import com.example.models.LoginRequest;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest req, HttpServletResponse res) {
        JwtResponse jwt = authService.authenticate(req);
        
        // Set JWT token in cookie (for applications using cookies)
        ResponseCookie cookie = ResponseCookie.from("jwt", jwt.getToken())
                .httpOnly(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        
        // Return JWT in response body (for applications using Authorization header)
        return ResponseEntity.ok(jwt);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Logged out");
    }

    // @PostMapping("/refresh-token")
    // public String refreshToken(@RequestBody String token) {
    //     // Implement token refresh logic
    //     return "Token refreshed";
    // }

    // @PostMapping("/reset-password")
    // public String resetPassword(@RequestBody PasswordResetRequest passwordResetRequest) {
    //     // Implement password reset logic
    //     return "Password reset successful";
    // }
}