-- =====================================================
-- Job Recruitment Database Setup Script
-- Run this script in MySQL to create the database
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS recruitment
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE recruitment;

-- =====================================================
-- Tables will be auto-created by Hibernate (ddl-auto=update)
-- But you can use this script for manual setup if needed
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CANDIDATE', 'ENTERPRISE') NOT NULL,
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    deactivation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- Candidate Profiles table
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    skills JSON DEFAULT '[]',
    bio TEXT,
    phone VARCHAR(20),
    address VARCHAR(255),
    cv_url VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Enterprise Profiles table
CREATE TABLE IF NOT EXISTS enterprise_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    industry VARCHAR(100),
    location VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Job Offers table
CREATE TABLE IF NOT EXISTS job_offers (
    id VARCHAR(36) PRIMARY KEY,
    enterprise_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('CDI', 'CDD', 'FREELANCE') NOT NULL,
    salary VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'CLOSED') DEFAULT 'ACTIVE',
    requirements JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enterprise_id) REFERENCES enterprise_profiles(id) ON DELETE CASCADE,
    INDEX idx_jobs_status (status),
    INDEX idx_jobs_type (type),
    INDEX idx_jobs_location (location(100))
) ENGINE=InnoDB;

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY,
    candidate_id VARCHAR(36) NOT NULL,
    job_offer_id VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    matching_score DOUBLE DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (job_offer_id) REFERENCES job_offers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_candidate_job (candidate_id, job_offer_id),
    INDEX idx_applications_status (status)
) ENGINE=InnoDB;

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL UNIQUE,
    date DATETIME NOT NULL,
    meeting_link VARCHAR(500) NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- =====================================================
-- Create an admin user (password: admin123)
-- Password hash generated with BCrypt
-- =====================================================
INSERT INTO users (id, email, password, role, is_active) VALUES 
(UUID(), 'admin@recruitment.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS8gPQJqIwqLF0BH.', 'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- =====================================================
-- Sample data (optional - uncomment to use)
-- =====================================================

/*
-- Sample Enterprise
INSERT INTO users (id, email, password, role, is_active) VALUES 
('ent-user-001', 'enterprise@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS8gPQJqIwqLF0BH.', 'ENTERPRISE', TRUE);

INSERT INTO enterprise_profiles (id, user_id, company_name, description, industry, location) VALUES
('ent-001', 'ent-user-001', 'Tech Corp', 'A leading technology company', 'Technology', 'Paris, France');

-- Sample Candidate
INSERT INTO users (id, email, password, role, is_active) VALUES 
('cand-user-001', 'candidate@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.rsS8gPQJqIwqLF0BH.', 'CANDIDATE', TRUE);

INSERT INTO candidate_profiles (id, user_id, first_name, last_name, skills, bio) VALUES
('cand-001', 'cand-user-001', 'John', 'Doe', '["Java", "Spring Boot", "React"]', 'Experienced full-stack developer');

-- Sample Job
INSERT INTO job_offers (id, enterprise_id, title, description, type, salary, location, requirements) VALUES
('job-001', 'ent-001', 'Senior Java Developer', 'Looking for an experienced Java developer...', 'CDI', '50000-70000€', 'Paris, France', '["Java", "Spring", "Hibernate"]');
*/

SELECT 'Database setup completed successfully!' AS status;
