package com.recruitment.service;

import com.recruitment.dto.response.NotificationResponse;
import com.recruitment.entity.Notification;
import com.recruitment.entity.User;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.NotificationRepository;
import com.recruitment.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for notification operations
 */
@ApplicationScoped
public class NotificationService {

    @Inject
    private NotificationRepository notificationRepository;

    @Inject
    private UserRepository userRepository;

    /**
     * Create a notification for a user
     */
    @Transactional
    public void createNotification(String userId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", 404));

        Notification notification = new Notification(user, content);
        notificationRepository.save(notification);
    }

    /**
     * Get notifications for a user
     */
    public List<NotificationResponse> getNotifications(String userId, int limit) {
        return notificationRepository.findByUserId(userId, limit).stream()
                .map(n -> new NotificationResponse(n.getId(), n.getContent(), n.isRead(),
                        n.getCreatedAt() != null ? n.getCreatedAt().toString() : null))
                .collect(Collectors.toList());
    }

    /**
     * Get unread count for a user
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
