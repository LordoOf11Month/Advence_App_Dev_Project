package com.example.DTO;

import jakarta.validation.constraints.*;
import java.sql.Timestamp;
import lombok.Data;

public class StoreDTO {

    @Data
    public static class StoreResponse {
        private Long id;
        private Long sellerId;
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
    }

    @Data
    public static class StoreCreateRequest {
        @NotNull
        private Long sellerId;

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
    public static class BanRequest {
        @NotNull
        private Boolean isBanned;

        private String banReason;
    }
}