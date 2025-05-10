package com.example.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressDTO {
    
    @Data
    public static class AddressResponse {
        private Integer id;
        private String street;
        private String city;
        private String state;
        private String country;
        private String zipCode;
        private boolean isDefault;
    }

    @Data
    public static class CreateAddressRequest {
        @NotBlank(message = "Street is required")
        @Size(max = 255, message = "Street must be less than 255 characters")
        private String street;

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must be less than 100 characters")
        private String city;

        @NotBlank(message = "State is required")
        @Size(max = 100, message = "State must be less than 100 characters")
        private String state;

        @NotBlank(message = "Country is required")
        @Size(max = 100, message = "Country must be less than 100 characters")
        private String country;

        @NotBlank(message = "ZIP code is required")
        @Size(max = 20, message = "ZIP code must be less than 20 characters")
        private String zipCode;

        private boolean isDefault;
    }

    @Data
    public static class UpdateAddressRequest {
        @Size(max = 255, message = "Street must be less than 255 characters")
        private String street;

        @Size(max = 100, message = "City must be less than 100 characters")
        private String city;

        @Size(max = 100, message = "State must be less than 100 characters")
        private String state;

        @Size(max = 100, message = "Country must be less than 100 characters")
        private String country;

        @Size(max = 20, message = "ZIP code must be less than 20 characters")
        private String zipCode;

        private Boolean isDefault;
    }
} 