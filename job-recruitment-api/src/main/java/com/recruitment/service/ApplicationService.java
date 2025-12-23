package com.recruitment.service;

import com.recruitment.dto.response.ApplicationResponse;
import com.recruitment.entity.Application;
import com.recruitment.entity.CandidateProfile;
import com.recruitment.entity.JobOffer;
import com.recruitment.enums.ApplicationStatus;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.CandidateProfileRepository;
import com.recruitment.repository.JobOfferRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for application operations
 */
@ApplicationScoped
public class ApplicationService {

        @Inject
        private ApplicationRepository applicationRepository;

        @Inject
        private CandidateProfileRepository candidateProfileRepository;

        @Inject
        private JobOfferRepository jobOfferRepository;

        @Inject
        private MatchingService matchingService;

        @Inject
        private NotificationService notificationService;

        /**
         * Get total application count
         */
        public long getApplicationCount() {
                return applicationRepository.count();
        }

        /**
         * Apply to a job
         */
        @Transactional
        public ApplicationResponse apply(String userId, String jobId) {
                // Get candidate profile
                CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                                .orElseThrow(() -> new ApiException("Candidate profile not found", 404));

                // Check if already applied
                if (applicationRepository.findByCandidateAndJob(candidate.getId(), jobId).isPresent()) {
                        throw new ApiException("You have already applied to this job", 400);
                }

                // Get job
                JobOffer job = jobOfferRepository.findByIdWithEnterprise(jobId)
                                .orElseThrow(() -> new ApiException("Job not found", 404));

                // Calculate matching score
                double matchingScore = matchingService.calculateMatchingScore(
                                candidate.getSkills(), job.getRequirements());

                // Create application
                Application application = new Application(candidate, job);
                application.setMatchingScore(matchingScore);
                application = applicationRepository.save(application);

                // Notify enterprise
                notificationService.createNotification(
                                job.getEnterprise().getUser().getId(),
                                String.format("New application received for \"%s\" with %.0f%% match!",
                                                job.getTitle(), matchingScore));

                return ApplicationResponse.fromEntity(application, false);
        }

        /**
         * Get applications for a candidate
         */
        public List<ApplicationResponse> getCandidateApplications(String userId) {
                CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                                .orElseThrow(() -> new ApiException("Candidate profile not found", 404));

                return applicationRepository.findByCandidateId(candidate.getId()).stream()
                                .map(app -> ApplicationResponse.fromEntity(app, false))
                                .collect(Collectors.toList());
        }

        /**
         * Get applications for an enterprise (with anonymous masking)
         */
        public List<ApplicationResponse> getEnterpriseApplications(String enterpriseId) {
                return applicationRepository.findByEnterpriseId(enterpriseId).stream()
                                .map(app -> ApplicationResponse.fromEntity(app, true))
                                .collect(Collectors.toList());
        }

        /**
         * Get applications for a specific job
         */
        public List<ApplicationResponse> getJobApplications(String jobId) {
                return applicationRepository.findByJobId(jobId).stream()
                                .map(app -> ApplicationResponse.fromEntity(app, true))
                                .collect(Collectors.toList());
        }

        /**
         * Get all applications (admin)
         */
        public List<ApplicationResponse> getAllApplications() {
                return applicationRepository.findAll().stream()
                                .map(app -> ApplicationResponse.fromEntity(app, false))
                                .collect(Collectors.toList());
        }

        /**
         * Update application status
         */
        @Transactional
        public void updateStatus(String applicationId, ApplicationStatus status) {
                Application application = applicationRepository.findByIdWithDetails(applicationId)
                                .orElseThrow(() -> new ApiException("Application not found", 404));

                application.setStatus(status);
                applicationRepository.save(application);

                // Notify candidate
                String statusText = status == ApplicationStatus.ACCEPTED ? "accepted" : "rejected";
                notificationService.createNotification(
                                application.getCandidate().getUser().getId(),
                                String.format("Your application for \"%s\" has been %s.",
                                                application.getJobOffer().getTitle(), statusText));
        }

        /**
         * Update application status by string (admin)
         */
        @Transactional
        public void updateApplicationStatus(String applicationId, String status) {
                ApplicationStatus appStatus = ApplicationStatus.valueOf(status.toUpperCase());
                updateStatus(applicationId, appStatus);
        }

        /**
         * Update application anonymity (admin)
         */
        @Transactional
        public void updateApplicationAnonymity(String applicationId, boolean isAnonymous) {
                Application application = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new ApiException("Application not found", 404));

                application.setAnonymous(isAnonymous);
                applicationRepository.save(application);
        }

        /**
         * Delete application (admin)
         */
        @Transactional
        public void deleteApplication(String applicationId) {
                Application application = applicationRepository.findById(applicationId)
                                .orElseThrow(() -> new ApiException("Application not found", 404));

                applicationRepository.delete(application);
        }
}
