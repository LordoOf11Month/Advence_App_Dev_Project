package com.example.DTO;

import lombok.Data;
import java.time.LocalDateTime;

public class NotificationDTO {
    @Data
    public static class NotificationResponse {
        private Long id;
        private String context;
        private LocalDateTime createdAt;
    }

    @Data
    public static class NotificationRequest {
        private Long userId;
        private String context;
    }
} 