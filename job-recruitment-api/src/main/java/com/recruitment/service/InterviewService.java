package com.recruitment.service;

import com.recruitment.dto.request.InterviewRequest;
import com.recruitment.dto.response.InterviewResponse;
import com.recruitment.entity.Application;
import com.recruitment.entity.Interview;
import com.recruitment.enums.ApplicationStatus;
import com.recruitment.enums.InterviewStatus;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.InterviewRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for interview operations
 */
@ApplicationScoped
public class InterviewService {

    @Inject
    private InterviewRepository interviewRepository;

    @Inject
    private ApplicationRepository applicationRepository;

    @Inject
    private NotificationService notificationService;

    /**
     * Schedule or update an interview
     */
    @Transactional
    public InterviewResponse scheduleInterview(InterviewRequest request) {
        Application application = applicationRepository.findByIdWithDetails(request.getApplicationId())
                .orElseThrow(() -> new ApiException("Application not found", 404));

        LocalDateTime interviewDate = LocalDateTime.parse(request.getDate(),
                DateTimeFormatter.ISO_DATE_TIME);

        // Check if interview already exists
        Interview interview = interviewRepository.findByApplicationId(request.getApplicationId())
                .orElse(null);

        if (interview != null) {
            // Update existing interview
            interview.setDate(interviewDate);
            interview.setMeetingLink(request.getMeetingLink());
            interview.setStatus(InterviewStatus.SCHEDULED);
        } else {
            // Create new interview
            interview = new Interview(application, interviewDate, request.getMeetingLink());
        }

        interview = interviewRepository.save(interview);

        // Update application status
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Notify candidate
        notificationService.createNotification(
                application.getCandidate().getUser().getId(),
                String.format("Interview scheduled for \"%s\"! Check your applications for the meeting link.",
                        application.getJobOffer().getTitle()));

        return InterviewResponse.fromEntity(interview);
    }

    /**
     * Get upcoming interviews for a candidate
     */
    public List<InterviewResponse> getUpcomingInterviews(String candidateId, int limit) {
        return interviewRepository.findUpcomingByCandidateId(candidateId, limit).stream()
                .map(InterviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all interviews (admin) with full application data
     */
    @Transactional
    public List<InterviewResponse> getAllInterviews() {
        return interviewRepository.findAllWithDetails().stream()
                .map(interview -> InterviewResponse.fromEntityWithApplication(interview, interview.getApplication()))
                .collect(Collectors.toList());
    }

    /**
     * Update interview status
     */
    @Transactional
    public void updateStatus(String interviewId, InterviewStatus status) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ApiException("Interview not found", 404));

        interview.setStatus(status);
        interviewRepository.save(interview);
    }
}
