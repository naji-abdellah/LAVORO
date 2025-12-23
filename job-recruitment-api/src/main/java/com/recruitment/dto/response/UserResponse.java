package com.recruitment.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.recruitment.entity.User;
import com.recruitment.enums.Role;

/**
 * User response DTO (for admin)
 */
public class UserResponse {

    private String id;
    private String email;
    private Role role;

    @JsonProperty("isActive")
    private boolean active;

    private String photoUrl;
    private String createdAt;

    // Candidate info
    private String candidateProfileId;
    private String firstName;
    private String lastName;

    // Enterprise info
    private String enterpriseProfileId;
    private String companyName;
    private String logoUrl;

    // Constructors
    public UserResponse() {
    }

    public static UserResponse fromEntity(User user) {
        UserResponse response = new UserResponse();
        response.id = user.getId();
        response.email = user.getEmail();
        response.role = user.getRole();
        response.active = user.isActive();
        response.photoUrl = user.getPhotoUrl();
        response.createdAt = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;

        if (user.getCandidateProfile() != null) {
            response.candidateProfileId = user.getCandidateProfile().getId();
            response.firstName = user.getCandidateProfile().getFirstName();
            response.lastName = user.getCandidateProfile().getLastName();
        }

        if (user.getEnterpriseProfile() != null) {
            response.enterpriseProfileId = user.getEnterpriseProfile().getId();
            response.companyName = user.getEnterpriseProfile().getCompanyName();
            response.logoUrl = user.getEnterpriseProfile().getLogoUrl();
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getCandidateProfileId() {
        return candidateProfileId;
    }

    public void setCandidateProfileId(String candidateProfileId) {
        this.candidateProfileId = candidateProfileId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEnterpriseProfileId() {
        return enterpriseProfileId;
    }

    public void setEnterpriseProfileId(String enterpriseProfileId) {
        this.enterpriseProfileId = enterpriseProfileId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
