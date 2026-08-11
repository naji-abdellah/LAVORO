package com.recruitment.dto.response;

import com.recruitment.entity.Interview;
import com.recruitment.entity.Application;
import com.recruitment.enums.InterviewStatus;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

/**
 * Interview response DTO
 */
public class InterviewResponse {

    private String id;
    private String date;
    private String meetingLink;
    private InterviewStatus status;
    private String createdAt;

    // Job info (when including in context)
    private String jobTitle;
    private String companyName;

    // Full application data for admin pages
    private Map<String, Object> application;

    // Constructors
    public InterviewResponse() {
    }

    public static InterviewResponse fromEntity(Interview interview) {
        InterviewResponse response = new InterviewResponse();
        response.id = interview.getId();
        response.date = interview.getDate() != null ? interview.getDate().toString() : null;
        response.meetingLink = interview.getMeetingLink();
        response.status = interview.getStatus();
        response.createdAt = interview.getCreatedAt() != null ? interview.getCreatedAt().toString() : null;
        return response;
    }

    public static InterviewResponse fromEntity(Interview interview, String jobTitle, String companyName) {
        InterviewResponse response = fromEntity(interview);
        response.jobTitle = jobTitle;
        response.companyName = companyName;
        return response;
    }

    public static InterviewResponse fromEntityWithApplication(Interview interview, Application app) {
        InterviewResponse response = fromEntity(interview);

        if (app != null) {
            Map<String, Object> appData = new HashMap<>();
            appData.put("id", app.getId());
            appData.put("status", app.getStatus() != null ? app.getStatus().name() : null);
            appData.put("matchingScore", app.getMatchingScore());

            // Candidate data
            if (app.getCandidate() != null) {
                Map<String, Object> candidateData = new HashMap<>();
                candidateData.put("id", app.getCandidate().getId());
                candidateData.put("firstName", app.getCandidate().getFirstName());
                candidateData.put("lastName", app.getCandidate().getLastName());

                if (app.getCandidate().getUser() != null) {
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("email", app.getCandidate().getUser().getEmail());
                    userData.put("photoUrl", app.getCandidate().getUser().getPhotoUrl());
                    candidateData.put("user", userData);
                }
                appData.put("candidate", candidateData);
            }

            // Job offer data
            if (app.getJobOffer() != null) {
                Map<String, Object> jobData = new HashMap<>();
                jobData.put("id", app.getJobOffer().getId());
                jobData.put("title", app.getJobOffer().getTitle());

                if (app.getJobOffer().getEnterprise() != null) {
                    Map<String, Object> enterpriseData = new HashMap<>();
                    enterpriseData.put("id", app.getJobOffer().getEnterprise().getId());
                    enterpriseData.put("companyName", app.getJobOffer().getEnterprise().getCompanyName());

                    if (app.getJobOffer().getEnterprise().getUser() != null) {
                        Map<String, Object> entUserData = new HashMap<>();
                        entUserData.put("email", app.getJobOffer().getEnterprise().getUser().getEmail());
                        enterpriseData.put("user", entUserData);
                    }
                    jobData.put("enterprise", enterpriseData);
                }
                appData.put("jobOffer", jobData);
            }

            response.application = appData;
            response.jobTitle = app.getJobOffer() != null ? app.getJobOffer().getTitle() : null;
            response.companyName = app.getJobOffer() != null && app.getJobOffer().getEnterprise() != null
                    ? app.getJobOffer().getEnterprise().getCompanyName()
                    : null;
        }

        return response;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Map<String, Object> getApplication() {
        return application;
    }

    public void setApplication(Map<String, Object> application) {
        this.application = application;
    }
}
