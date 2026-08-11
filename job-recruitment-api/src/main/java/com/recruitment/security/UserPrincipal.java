package com.recruitment.security;

import java.security.Principal;

/**
 * Custom principal for authenticated users
 */
public class UserPrincipal implements Principal {

    private final String userId;
    private final String email;
    private final String role;

    public UserPrincipal(String userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    @Override
    public String getName() {
        return userId;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
