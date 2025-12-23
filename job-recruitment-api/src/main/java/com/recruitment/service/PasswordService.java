package com.recruitment.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Service for password hashing and verification
 */
@ApplicationScoped
public class PasswordService {

    private static final int LOG_ROUNDS = 10;

    /**
     * Hash a password using BCrypt
     */
    public String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(LOG_ROUNDS));
    }

    /**
     * Verify a password against a hash
     */
    public boolean verifyPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
}
