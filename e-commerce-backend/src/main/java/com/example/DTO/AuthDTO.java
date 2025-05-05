package com.example.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.example.DTO.UserDTO.UserResponse;

import java.util.List;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8)
        private String password;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class SellerRegisterRequest extends RegisterRequest {
        @NotBlank
        private String storeName;
        private String storeDescription;
        private String bankName;
        private String accountHolder;
        private String accountNumber;
    }

    @Data
    public static class AuthResponse {
        private UserResponse user;
        private String token;
        private String refreshToken;
    }

    @Data
    public static class JwtResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String email;
        private List<String> roles;
    }
        @Data
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }
}