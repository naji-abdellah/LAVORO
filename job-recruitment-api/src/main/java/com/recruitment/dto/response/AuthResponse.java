package com.recruitment.dto.response;

import com.recruitment.enums.Role;

/**
 * Authentication response DTO
 */
public class AuthResponse {

    private boolean success;
    private String token;
    private String userId;
    private String email;
    private Role role;
    private String error;

    // Constructors
    public AuthResponse() {
    }

    public static AuthResponse success(String token, String userId, String email, Role role) {
        AuthResponse response = new AuthResponse();
        response.success = true;
        response.token = token;
        response.userId = userId;
        response.email = email;
        response.role = role;
        return response;
    }

    public static AuthResponse error(String error) {
        AuthResponse response = new AuthResponse();
        response.success = false;
        response.error = error;
        return response;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
