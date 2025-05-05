package com.example.DTO;

import jakarta.validation.constraints.*;

import java.security.PublicKey;
import java.sql.Timestamp;
import lombok.Data;

public class StoreDTO {

    @Data
    public static class StoreResponse {
        private Long id;
        private int sellerId;
        private String storeName;
        private String description;
        private Timestamp createdAt;
        private Float averageRating;
        private Integer totalSales;
        private Boolean isBanned;
        private Timestamp bannedDate;
        private String banReason;
        private String email;
        private String bankName;
        private String accountHolder;
        private String accountNumber;
        private String street;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }

    @Data
    public static class StoreCreateRequest {
        @NotNull
        private int sellerId;

        @NotBlank
        @Size(max = 20)
        private String storeName;

        private String description;

        @NotBlank
        @Email
        @Size(max = 70)
        private String email;

        private String bankName;

        private String accountHolder;

        private String accountNumber;

        private String street;

        private String city;

        private String state;

        private String postalCode;

        private String country;
    }

    @Data
    public static class StoreUpdateRequest {
        @Size(max = 20)
        private String storeName;

        private String description;

        @Email
        @Size(max = 70)
        private String email;

        private String bankName;

        private String accountHolder;

        private String accountNumber;

        private Boolean isBanned;

        private String banReason;
    }

    @Data
    public static class AddressUpdateRequest {
        @NotBlank
        private String street;
        @NotBlank
        private String city;
        @NotBlank
        private String state;
        @NotBlank
        private String postalCode;
        @NotBlank
        private String country;
    }

    @Data
    public static class BanRequest {
        @NotNull
        private Boolean isBanned;

        private String banReason;
    }
}