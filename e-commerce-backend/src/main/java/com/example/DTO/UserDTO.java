package com.example.DTO;

import jakarta.validation.constraints.Pattern;
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
        private String firstName;
        private String lastName;
        private String phoneNumber;
        @Pattern(regexp = "customer|seller|platform_admin")  // must match enum values exactly
        private String role;
        private String avatarUrl;
    }

    @Data
    public static class BanRequest {
        // Optionally allow setting ban reason when banning a user
        private String banReason;
    }
}