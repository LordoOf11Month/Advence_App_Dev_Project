package com.example.services;

import com.example.DTO.NotificationDTO;
import com.example.models.Notification;
import com.example.models.User;
import com.example.repositories.NotificationRepository;
import com.example.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Page<NotificationDTO.NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDto);
    }

    @Transactional
    public void createNotification(Long userId, String context) {
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setContext(context);
        notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void deleteAllUserNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    private NotificationDTO.NotificationResponse convertToDto(Notification notification) {
        NotificationDTO.NotificationResponse response = new NotificationDTO.NotificationResponse();
        response.setId(notification.getId());
        response.setContext(notification.getContext());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
} 