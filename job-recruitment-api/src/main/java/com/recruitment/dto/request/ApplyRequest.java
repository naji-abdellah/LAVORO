package com.recruitment.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Job application request DTO
 */
public class ApplyRequest {

    @NotBlank(message = "Job ID is required")
    private String jobId;

    // Constructors
    public ApplyRequest() {
    }

    public ApplyRequest(String jobId) {
        this.jobId = jobId;
    }

    // Getters and Setters
    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
}
