package com.recruitment.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * User status update request DTO (admin)
 */
public class UserStatusRequest {

    private String userId;

    @JsonProperty("isActive")
    private boolean active;

    private String deactivationReason;

    // Constructors
    public UserStatusRequest() {
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getDeactivationReason() {
        return deactivationReason;
    }

    public void setDeactivationReason(String deactivationReason) {
        this.deactivationReason = deactivationReason;
    }
}
