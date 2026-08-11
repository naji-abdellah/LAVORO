package com.recruitment.resource;

import com.recruitment.dto.request.ProfileUpdateRequest;
import com.recruitment.dto.response.UserResponse;
import com.recruitment.entity.User;
import com.recruitment.entity.CandidateProfile;
import com.recruitment.entity.EnterpriseProfile;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.UserRepository;
import com.recruitment.security.Secured;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.UserService;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.HashMap;
import java.util.Map;

/**
 * REST resource for user profile endpoints
 */
@Path("/api/profile")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
@Secured
public class ProfileResource {

    @Inject
    private UserService userService;

    @Inject
    private UserRepository userRepository;

    /**
     * Get current user profile with full details
     */
    @GET
    public Response getProfile(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();

        User user = userRepository.findByIdWithProfiles(principal.getUserId())
                .orElseThrow(() -> new ApiException("User not found", 404));

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole().name());
        userData.put("photoUrl", user.getPhotoUrl());
        userData.put("isActive", user.isActive());
        userData.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        // Include candidate profile details
        if (user.getCandidateProfile() != null) {
            CandidateProfile cp = user.getCandidateProfile();
            userData.put("firstName", cp.getFirstName());
            userData.put("lastName", cp.getLastName());
            userData.put("bio", cp.getBio());
            userData.put("phone", cp.getPhone());
            userData.put("address", cp.getAddress());
            userData.put("skills", cp.getSkills());
            userData.put("cvUrl", cp.getCvUrl());
        }

        // Include enterprise profile details
        if (user.getEnterpriseProfile() != null) {
            EnterpriseProfile ep = user.getEnterpriseProfile();
            userData.put("companyName", ep.getCompanyName());
            userData.put("description", ep.getDescription());
            userData.put("industry", ep.getIndustry());
            userData.put("location", ep.getLocation());
            userData.put("logoUrl", ep.getLogoUrl());
        }

        return Response.ok(Map.of("user", userData)).build();
    }

    /**
     * Update current user profile
     */
    @PUT
    public Response updateProfile(ProfileUpdateRequest request, @Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        userService.updateProfile(principal.getUserId(), request);
        return Response.ok(Map.of("success", true)).build();
    }
}
