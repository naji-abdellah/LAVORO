package com.recruitment.dto.response;

import java.util.List;

/**
 * Dashboard statistics response DTO
 */
public class DashboardStatsResponse {

    // Candidate stats
    private Long totalApplications;
    private Long pendingApplications;
    private Long interviews;
    private Long acceptedApplications;
    private List<InterviewResponse> upcomingInterviews;

    // Enterprise stats
    private Long activeJobs;
    private Long scheduledInterviews;
    private List<ApplicationResponse> recentApplications;

    // Constructors
    public DashboardStatsResponse() {
    }

    // Factory methods
    public static DashboardStatsResponse forCandidate(
            Long totalApplications,
            Long pendingApplications,
            Long interviews,
            Long acceptedApplications,
            List<InterviewResponse> upcomingInterviews) {
        DashboardStatsResponse response = new DashboardStatsResponse();
        response.totalApplications = totalApplications;
        response.pendingApplications = pendingApplications;
        response.interviews = interviews;
        response.acceptedApplications = acceptedApplications;
        response.upcomingInterviews = upcomingInterviews;
        return response;
    }

    public static DashboardStatsResponse forEnterprise(
            Long activeJobs,
            Long totalApplications,
            Long pendingApplications,
            Long scheduledInterviews,
            List<ApplicationResponse> recentApplications) {
        DashboardStatsResponse response = new DashboardStatsResponse();
        response.activeJobs = activeJobs;
        response.totalApplications = totalApplications;
        response.pendingApplications = pendingApplications;
        response.scheduledInterviews = scheduledInterviews;
        response.recentApplications = recentApplications;
        return response;
    }

    // Getters and Setters
    public Long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(Long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public Long getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(Long pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public Long getInterviews() {
        return interviews;
    }

    public void setInterviews(Long interviews) {
        this.interviews = interviews;
    }

    public Long getAcceptedApplications() {
        return acceptedApplications;
    }

    public void setAcceptedApplications(Long acceptedApplications) {
        this.acceptedApplications = acceptedApplications;
    }

    public List<InterviewResponse> getUpcomingInterviews() {
        return upcomingInterviews;
    }

    public void setUpcomingInterviews(List<InterviewResponse> upcomingInterviews) {
        this.upcomingInterviews = upcomingInterviews;
    }

    public Long getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(Long activeJobs) {
        this.activeJobs = activeJobs;
    }

    public Long getScheduledInterviews() {
        return scheduledInterviews;
    }

    public void setScheduledInterviews(Long scheduledInterviews) {
        this.scheduledInterviews = scheduledInterviews;
    }

    public List<ApplicationResponse> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<ApplicationResponse> recentApplications) {
        this.recentApplications = recentApplications;
    }
}
