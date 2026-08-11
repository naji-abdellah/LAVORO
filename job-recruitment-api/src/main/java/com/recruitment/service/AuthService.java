package com.recruitment.service;

import com.recruitment.dto.request.LoginRequest;
import com.recruitment.dto.request.RegisterRequest;
import com.recruitment.dto.response.AuthResponse;
import com.recruitment.entity.CandidateProfile;
import com.recruitment.entity.EnterpriseProfile;
import com.recruitment.entity.User;
import com.recruitment.enums.Role;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Service for authentication operations
 */
@ApplicationScoped
public class AuthService {

    @Inject
    private UserRepository userRepository;

    @Inject
    private PasswordService passwordService;

    @Inject
    private JwtTokenService jwtTokenService;

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", 400);
        }

        // Hash password
        String hashedPassword = passwordService.hashPassword(request.getPassword());

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setRole(request.getRole());

        // Create profile based on role
        if (request.getRole() == Role.CANDIDATE) {
            CandidateProfile profile = new CandidateProfile();
            profile.setFirstName(request.getFirstName());
            profile.setLastName(request.getLastName());
            profile.setSkills(request.getSkills() != null ? request.getSkills() : "[]");
            profile.setBio(request.getBio());
            profile.setPhone(request.getPhone());
            profile.setAddress(request.getAddress());
            user.setCandidateProfile(profile);
        } else if (request.getRole() == Role.ENTERPRISE) {
            EnterpriseProfile profile = new EnterpriseProfile();
            profile.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : "Company Name");
            profile.setDescription(request.getDescription());
            profile.setIndustry(request.getIndustry());
            profile.setLocation(request.getLocation());
            user.setEnterpriseProfile(profile);
        }

        // Save user
        user = userRepository.save(user);

        // Generate token
        String token = jwtTokenService.generateToken(user);

        return AuthResponse.success(token, user.getId(), user.getEmail(), user.getRole());
    }

    /**
     * Login a user
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", 401));

        // Verify password
        if (!passwordService.verifyPassword(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid email or password", 401);
        }

        // Check if active
        if (!user.isActive()) {
            String reason = user.getDeactivationReason();
            if (reason != null && !reason.isEmpty()) {
                throw new ApiException("DEACTIVATED:" + reason, 401);
            } else {
                throw new ApiException(
                        "DEACTIVATED:Your account has been deactivated. Please contact support for more information.",
                        401);
            }
        }

        // Generate token
        String token = jwtTokenService.generateToken(user);

        return AuthResponse.success(token, user.getId(), user.getEmail(), user.getRole());
    }

    /**
     * Get user from token
     */
    public User getUserFromToken(String token) {
        String userId = jwtTokenService.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", 404));
    }
}
