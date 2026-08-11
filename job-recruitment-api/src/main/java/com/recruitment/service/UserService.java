package com.recruitment.service;

import com.recruitment.dto.request.ProfileUpdateRequest;
import com.recruitment.dto.request.UserStatusRequest;
import com.recruitment.dto.response.DashboardStatsResponse;
import com.recruitment.dto.response.ApplicationResponse;
import com.recruitment.dto.response.InterviewResponse;
import com.recruitment.dto.response.UserResponse;
import com.recruitment.entity.CandidateProfile;
import com.recruitment.entity.EnterpriseProfile;
import com.recruitment.entity.User;
import com.recruitment.enums.ApplicationStatus;
import com.recruitment.enums.JobStatus;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user operations
 */
@ApplicationScoped
public class UserService {

    @Inject
    private UserRepository userRepository;

    @Inject
    private CandidateProfileRepository candidateProfileRepository;

    @Inject
    private EnterpriseProfileRepository enterpriseProfileRepository;

    @Inject
    private ApplicationRepository applicationRepository;

    @Inject
    private JobOfferRepository jobOfferRepository;

    @Inject
    private InterviewRepository interviewRepository;

    /**
     * Get total user count
     */
    public long getUserCount() {
        return userRepository.count();
    }

    /**
     * Get candidate count
     */
    public long getCandidateCount() {
        return candidateProfileRepository.count();
    }

    /**
     * Get enterprise count
     */
    public long getEnterpriseCount() {
        return enterpriseProfileRepository.count();
    }

    /**
     * Get recent user registrations
     */
    @Transactional
    public List<UserResponse> getRecentUsers(int limit) {
        return userRepository.findRecentUsers(limit).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all users (admin)
     */
    @Transactional
    public List<UserResponse> getAllUsers() {
        return userRepository.findAllWithProfiles().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    @Transactional
    public UserResponse getUserById(String userId) {
        User user = userRepository.findByIdWithProfiles(userId)
                .orElseThrow(() -> new ApiException("User not found", 404));
        return UserResponse.fromEntity(user);
    }

    /**
     * Get detailed user info with full profile and stats
     */
    @Transactional
    public java.util.Map<String, Object> getUserDetails(String userId) {
        User user = userRepository.findByIdWithProfiles(userId)
                .orElseThrow(() -> new ApiException("User not found", 404));

        java.util.Map<String, Object> result = new java.util.HashMap<>();

        // User basic info
        java.util.Map<String, Object> userData = new java.util.HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole().name());
        userData.put("isActive", user.isActive());
        userData.put("photoUrl", user.getPhotoUrl());
        userData.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        result.put("user", userData);

        // Profile details and stats
        java.util.Map<String, Object> profile = null;
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("applicationCount", 0L);
        stats.put("jobCount", 0L);

        if (user.getCandidateProfile() != null) {
            CandidateProfile cp = user.getCandidateProfile();
            profile = new java.util.HashMap<>();
            profile.put("type", "candidate");
            profile.put("firstName", cp.getFirstName());
            profile.put("lastName", cp.getLastName());
            profile.put("bio", cp.getBio());
            profile.put("phone", cp.getPhone());
            profile.put("address", cp.getAddress());
            profile.put("cvUrl", cp.getCvUrl());

            // Parse skills JSON
            String skillsJson = cp.getSkills();
            if (skillsJson != null && !skillsJson.isEmpty()) {
                profile.put("skills", skillsJson);
            } else {
                profile.put("skills", "[]");
            }

            // Stats for candidate
            stats.put("applicationCount", applicationRepository.countByCandidateId(cp.getId()));
        }

        if (user.getEnterpriseProfile() != null) {
            EnterpriseProfile ep = user.getEnterpriseProfile();
            profile = new java.util.HashMap<>();
            profile.put("type", "enterprise");
            profile.put("companyName", ep.getCompanyName());
            profile.put("description", ep.getDescription());
            profile.put("industry", ep.getIndustry());
            profile.put("location", ep.getLocation());
            profile.put("logoUrl", ep.getLogoUrl());

            // Stats for enterprise
            stats.put("jobCount", jobOfferRepository.countByEnterpriseId(ep.getId()));
        }

        result.put("profile", profile);
        result.put("stats", stats);

        return result;
    }

    /**
     * Update user status (activate/deactivate)
     */
    @Transactional
    public void updateUserStatus(UserStatusRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException("User not found", 404));

        user.setActive(request.isActive());
        if (!request.isActive()) {
            user.setDeactivationReason(request.getDeactivationReason());
        } else {
            user.setDeactivationReason(null);
        }

        userRepository.save(user);
    }

    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", 404));
        userRepository.delete(user);
    }

    /**
     * Update profile
     */
    @Transactional
    public void updateProfile(String userId, ProfileUpdateRequest request) {
        User user = userRepository.findByIdWithProfiles(userId)
                .orElseThrow(() -> new ApiException("User not found", 404));

        // Update photo URL if provided
        if (request.getPhotoUrl() != null) {
            user.setPhotoUrl(request.getPhotoUrl());
            userRepository.save(user);
        }

        // Update candidate profile
        if (user.getCandidateProfile() != null) {
            CandidateProfile profile = user.getCandidateProfile();
            if (request.getFirstName() != null)
                profile.setFirstName(request.getFirstName());
            if (request.getLastName() != null)
                profile.setLastName(request.getLastName());
            if (request.getSkills() != null)
                profile.setSkills(request.getSkills());
            if (request.getBio() != null)
                profile.setBio(request.getBio());
            if (request.getPhone() != null)
                profile.setPhone(request.getPhone());
            if (request.getAddress() != null)
                profile.setAddress(request.getAddress());
            if (request.getCvUrl() != null)
                profile.setCvUrl(request.getCvUrl());
            candidateProfileRepository.save(profile);
        }

        // Update enterprise profile
        if (user.getEnterpriseProfile() != null) {
            EnterpriseProfile profile = user.getEnterpriseProfile();
            if (request.getCompanyName() != null)
                profile.setCompanyName(request.getCompanyName());
            if (request.getDescription() != null)
                profile.setDescription(request.getDescription());
            if (request.getIndustry() != null)
                profile.setIndustry(request.getIndustry());
            if (request.getLocation() != null)
                profile.setLocation(request.getLocation());
            if (request.getLogoUrl() != null)
                profile.setLogoUrl(request.getLogoUrl());
            enterpriseProfileRepository.save(profile);
        }
    }

    /**
     * Get candidate dashboard stats
     */
    public DashboardStatsResponse getCandidateDashboardStats(String userId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Candidate profile not found", 404));

        long totalApplications = applicationRepository.countByCandidateId(candidate.getId());
        long pendingApplications = applicationRepository.countByCandidateIdAndStatus(
                candidate.getId(), ApplicationStatus.PENDING);
        long interviews = applicationRepository.countByCandidateIdAndStatus(
                candidate.getId(), ApplicationStatus.INTERVIEW_SCHEDULED);
        long acceptedApplications = applicationRepository.countByCandidateIdAndStatus(
                candidate.getId(), ApplicationStatus.ACCEPTED);

        List<InterviewResponse> upcomingInterviews = interviewRepository
                .findUpcomingByCandidateId(candidate.getId(), 5).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());

        return DashboardStatsResponse.forCandidate(
                totalApplications, pendingApplications, interviews,
                acceptedApplications, upcomingInterviews);
    }

    /**
     * Get enterprise dashboard stats
     */
    public DashboardStatsResponse getEnterpriseDashboardStats(String userId) {
        EnterpriseProfile enterprise = enterpriseProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Enterprise profile not found", 404));

        long activeJobs = jobOfferRepository.countByEnterpriseIdAndStatus(
                enterprise.getId(), JobStatus.ACTIVE);
        long totalApplications = applicationRepository.countByEnterpriseId(enterprise.getId());
        long pendingApplications = applicationRepository.countByEnterpriseIdAndStatus(
                enterprise.getId(), ApplicationStatus.PENDING);
        long scheduledInterviews = applicationRepository.countByEnterpriseIdAndStatus(
                enterprise.getId(), ApplicationStatus.INTERVIEW_SCHEDULED);

        List<ApplicationResponse> recentApplications = applicationRepository
                .findByEnterpriseId(enterprise.getId()).stream()
                .limit(5)
                .map(app -> ApplicationResponse.fromEntity(app, true))
                .collect(Collectors.toList());

        return DashboardStatsResponse.forEnterprise(
                activeJobs, totalApplications, pendingApplications,
                scheduledInterviews, recentApplications);
    }
}
