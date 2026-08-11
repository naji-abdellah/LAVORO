package com.recruitment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Interview scheduling request DTO
 */
public class InterviewRequest {

    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @NotNull(message = "Date is required")
    private String date; // ISO date string

    @NotBlank(message = "Meeting link is required")
    private String meetingLink;

    // Constructors
    public InterviewRequest() {
    }

    // Getters and Setters
    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }
}
