package com.recruitment.dto.response;

import com.recruitment.entity.Application;
import com.recruitment.enums.ApplicationStatus;
import java.time.LocalDateTime;

/**
 * Application response DTO
 */
public class ApplicationResponse {

    private String id;
    private ApplicationStatus status;
    private double matchingScore;
    private boolean isAnonymous;
    private String createdAt;
    private String updatedAt;

    // Candidate info (may be hidden for anonymous)
    private String candidateId;
    private String candidateEmail;
    private String candidateFirstName;
    private String candidateLastName;
    private String candidateBio;
    private String candidatePhone;
    private String candidateCvUrl;
    private String candidateSkills;
    private String candidatePhotoUrl;

    // Job info
    private String jobId;
    private String jobTitle;
    private String jobLocation;
    private String companyName;

    // Interview info
    private InterviewResponse interview;

    // Constructors
    public ApplicationResponse() {
    }

    public static ApplicationResponse fromEntity(Application app, boolean hideCandidate) {
        ApplicationResponse response = new ApplicationResponse();
        response.id = app.getId();
        response.status = app.getStatus();
        response.matchingScore = app.getMatchingScore();
        response.isAnonymous = app.isAnonymous();
        response.createdAt = app.getCreatedAt() != null ? app.getCreatedAt().toString() : null;
        response.updatedAt = app.getUpdatedAt() != null ? app.getUpdatedAt().toString() : null;

        // Candidate info
        if (app.getCandidate() != null) {
            response.candidateId = app.getCandidate().getId();

            if (hideCandidate && app.isAnonymous()) {
                response.candidateEmail = "anonymous@candidate.hidden";
                response.candidateFirstName = null;
                response.candidateLastName = null;
                response.candidateBio = null;
                response.candidatePhone = null;
                response.candidateCvUrl = null;
                response.candidateSkills = null;
                response.candidatePhotoUrl = null;
            } else {
                if (app.getCandidate().getUser() != null) {
                    response.candidateEmail = app.getCandidate().getUser().getEmail();
                    response.candidatePhotoUrl = app.getCandidate().getUser().getPhotoUrl();
                }
                response.candidateFirstName = app.getCandidate().getFirstName();
                response.candidateLastName = app.getCandidate().getLastName();
                response.candidateBio = app.getCandidate().getBio();
                response.candidatePhone = app.getCandidate().getPhone();
                response.candidateCvUrl = app.getCandidate().getCvUrl();
                response.candidateSkills = app.getCandidate().getSkills();
            }
        }

        // Job info
        if (app.getJobOffer() != null) {
            response.jobId = app.getJobOffer().getId();
            response.jobTitle = app.getJobOffer().getTitle();
            response.jobLocation = app.getJobOffer().getLocation();

            if (app.getJobOffer().getEnterprise() != null) {
                response.companyName = app.getJobOffer().getEnterprise().getCompanyName();
            }
        }

        // Interview - pass job info directly to avoid lazy loading back navigation
        if (app.getInterview() != null) {
            String jobTitle = app.getJobOffer() != null ? app.getJobOffer().getTitle() : null;
            String companyName = (app.getJobOffer() != null && app.getJobOffer().getEnterprise() != null)
                    ? app.getJobOffer().getEnterprise().getCompanyName()
                    : null;
            response.interview = InterviewResponse.fromEntity(app.getInterview(), jobTitle, companyName);
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

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public double getMatchingScore() {
        return matchingScore;
    }

    public void setMatchingScore(double matchingScore) {
        this.matchingScore = matchingScore;
    }

    public boolean isAnonymous() {
        return isAnonymous;
    }

    public void setAnonymous(boolean anonymous) {
        isAnonymous = anonymous;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public String getCandidateFirstName() {
        return candidateFirstName;
    }

    public void setCandidateFirstName(String candidateFirstName) {
        this.candidateFirstName = candidateFirstName;
    }

    public String getCandidateLastName() {
        return candidateLastName;
    }

    public void setCandidateLastName(String candidateLastName) {
        this.candidateLastName = candidateLastName;
    }

    public String getCandidateBio() {
        return candidateBio;
    }

    public void setCandidateBio(String candidateBio) {
        this.candidateBio = candidateBio;
    }

    public String getCandidatePhone() {
        return candidatePhone;
    }

    public void setCandidatePhone(String candidatePhone) {
        this.candidatePhone = candidatePhone;
    }

    public String getCandidateCvUrl() {
        return candidateCvUrl;
    }

    public void setCandidateCvUrl(String candidateCvUrl) {
        this.candidateCvUrl = candidateCvUrl;
    }

    public String getCandidateSkills() {
        return candidateSkills;
    }

    public void setCandidateSkills(String candidateSkills) {
        this.candidateSkills = candidateSkills;
    }

    public String getCandidatePhotoUrl() {
        return candidatePhotoUrl;
    }

    public void setCandidatePhotoUrl(String candidatePhotoUrl) {
        this.candidatePhotoUrl = candidatePhotoUrl;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobLocation() {
        return jobLocation;
    }

    public void setJobLocation(String jobLocation) {
        this.jobLocation = jobLocation;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public InterviewResponse getInterview() {
        return interview;
    }

    public void setInterview(InterviewResponse interview) {
        this.interview = interview;
    }
}
