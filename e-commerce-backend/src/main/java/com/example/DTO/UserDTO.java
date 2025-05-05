package com.example.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.sql.Timestamp;
import java.time.OffsetDateTime;

public class UserDTO {

    @Data
    public static class UserResponse {
        private int id;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String role;            // maps from User.Role enum as string
        private Timestamp createdAt;
        private String stripeCustomerId;
        private Boolean isBanned;
        private OffsetDateTime bannedAt;
        private String banReason;
        private String avatarUrl;
    }

    @Data
    public static class UpdateUserRequest {
        @NotBlank // Ensure first name is not null or empty
        @Size(max = 100) // Example size constraint
        private String firstName;

        @NotBlank // Ensure last name is not null or empty
        @Size(max = 100) // Example size constraint
        private String lastName;

        // Add validation for phone number if needed (e.g., pattern for digits)
        private String phoneNumber;

        @Pattern(regexp = "customer|seller|admin", message = "Invalid role") // must match enum values exactly
        private String role;

        // Add validation for avatarUrl if needed (e.g., URL format)
        private String avatarUrl;

        // Consider adding validation for email if it can be updated here
        // @NotBlank @Email @Size(max = 255) private String email;
    }

    @Data
    public static class BanRequest {
        @NotBlank // Ensure ban reason is provided
        @Size(min = 10, message = "Ban reason must be at least 10 characters long") // Example minimum length
        private String banReason;
    }
}