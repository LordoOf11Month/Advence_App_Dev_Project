package com.example.DTO;

import lombok.Data;

@Data
public class CustomerDTO {
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String stripeCustomerId;
} 