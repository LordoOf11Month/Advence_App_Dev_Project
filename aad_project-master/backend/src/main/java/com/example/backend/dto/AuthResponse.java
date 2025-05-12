package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private UserDTO user;

    public AuthResponse(String token) {
        this.token = token;
    }
    
    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
} 