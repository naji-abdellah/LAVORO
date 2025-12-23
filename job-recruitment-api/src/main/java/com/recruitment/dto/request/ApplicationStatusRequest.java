package com.recruitment.dto.request;

import com.recruitment.enums.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Application status update request DTO
 */
public class ApplicationStatusRequest {

    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @NotNull(message = "Status is required")
    private ApplicationStatus status;

    // Constructors
    public ApplicationStatusRequest() {
    }

    // Getters and Setters
    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}
