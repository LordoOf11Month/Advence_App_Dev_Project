package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IssueDTO {
    private Long id;
    private Long orderItemId;
    private String userEmail;
    private String type;
    private String description;
    private String status;
    private String resolvedByEmail;
} 