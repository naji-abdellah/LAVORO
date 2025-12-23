package com.recruitment.dto.response;

/**
 * Notification response DTO
 */
public class NotificationResponse {

    private String id;
    private String content;
    private boolean read;
    private String createdAt;

    // Constructors
    public NotificationResponse() {
    }

    public NotificationResponse(String id, String content, boolean read, String createdAt) {
        this.id = id;
        this.content = content;
        this.read = read;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
