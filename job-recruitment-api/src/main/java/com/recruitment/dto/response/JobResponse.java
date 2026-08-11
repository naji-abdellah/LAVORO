package com.recruitment.dto.response;

import com.recruitment.entity.JobOffer;
import com.recruitment.enums.JobStatus;
import com.recruitment.enums.JobType;

/**
 * Job response DTO
 */
public class JobResponse {

    private String id;
    private String title;
    private String description;
    private JobType type;
    private String salary;
    private String location;
    private JobStatus status;
    private String requirements;
    private String createdAt;
    private String updatedAt;
    private int applicationCount;
    private boolean hasApplied;

    // Enterprise info
    private String enterpriseId;
    private String companyName;
    private String companyLogoUrl;
    private String companyDescription;
    private String companyIndustry;
    private String companyLocation;

    // Constructors
    public JobResponse() {
    }

    public static JobResponse fromEntity(JobOffer job) {
        JobResponse response = new JobResponse();
        response.id = job.getId();
        response.title = job.getTitle();
        response.description = job.getDescription();
        response.type = job.getType();
        response.salary = job.getSalary();
        response.location = job.getLocation();
        response.status = job.getStatus();
        response.requirements = job.getRequirements();
        response.createdAt = job.getCreatedAt() != null ? job.getCreatedAt().toString() : null;
        response.updatedAt = job.getUpdatedAt() != null ? job.getUpdatedAt().toString() : null;
        // Avoid lazy loading exception - use 0 if applications not loaded
        try {
            response.applicationCount = job.getApplicationCount();
        } catch (Exception e) {
            response.applicationCount = 0;
        }

        if (job.getEnterprise() != null) {
            response.enterpriseId = job.getEnterprise().getId();
            response.companyName = job.getEnterprise().getCompanyName();
            response.companyLogoUrl = job.getEnterprise().getLogoUrl();
            response.companyDescription = job.getEnterprise().getDescription();
            response.companyIndustry = job.getEnterprise().getIndustry();
            response.companyLocation = job.getEnterprise().getLocation();
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public JobType getType() {
        return type;
    }

    public void setType(JobType type) {
        this.type = type;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
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

    public int getApplicationCount() {
        return applicationCount;
    }

    public void setApplicationCount(int applicationCount) {
        this.applicationCount = applicationCount;
    }

    public boolean isHasApplied() {
        return hasApplied;
    }

    public void setHasApplied(boolean hasApplied) {
        this.hasApplied = hasApplied;
    }

    public String getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(String enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public String getCompanyIndustry() {
        return companyIndustry;
    }

    public void setCompanyIndustry(String companyIndustry) {
        this.companyIndustry = companyIndustry;
    }

    public String getCompanyLocation() {
        return companyLocation;
    }

    public void setCompanyLocation(String companyLocation) {
        this.companyLocation = companyLocation;
    }
}
