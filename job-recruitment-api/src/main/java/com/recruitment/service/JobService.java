package com.recruitment.service;

import com.recruitment.dto.request.JobRequest;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.entity.EnterpriseProfile;
import com.recruitment.entity.JobOffer;
import com.recruitment.enums.JobStatus;
import com.recruitment.enums.JobType;
import com.recruitment.exception.ApiException;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.EnterpriseProfileRepository;
import com.recruitment.repository.JobOfferRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for job operations
 */
@ApplicationScoped
public class JobService {

    @Inject
    private JobOfferRepository jobOfferRepository;

    @Inject
    private EnterpriseProfileRepository enterpriseProfileRepository;

    @Inject
    private ApplicationRepository applicationRepository;

    @Inject
    private MatchingService matchingService;

    /**
     * Get total job count
     */
    public long getJobCount() {
        return jobOfferRepository.count();
    }

    /**
     * Get all active jobs with optional filters
     */
    @Transactional
    public List<JobResponse> getActiveJobs(String type, String location, String search, String candidateId) {
        JobType jobType = null;
        if (type != null && !type.isEmpty() && !type.equals("all")) {
            try {
                jobType = JobType.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid type, ignore filter
            }
        }

        List<JobOffer> jobs = jobOfferRepository.findActiveJobs(jobType, location, search);

        // Get applied job IDs for candidate
        Set<String> appliedJobIds = Set.of();
        if (candidateId != null) {
            appliedJobIds = Set.copyOf(applicationRepository.findAppliedJobIdsByCandidateId(candidateId));
        }

        Set<String> finalAppliedJobIds = appliedJobIds;
        return jobs.stream()
                .map(job -> {
                    JobResponse response = JobResponse.fromEntity(job);
                    response.setHasApplied(finalAppliedJobIds.contains(job.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get job by ID
     */
    @Transactional
    public JobResponse getJobById(String jobId) {
        JobOffer job = jobOfferRepository.findActiveById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", 404));
        return JobResponse.fromEntity(job);
    }

    /**
     * Get all jobs (including closed) - for admin
     */
    @Transactional
    public List<JobResponse> getAllJobs() {
        return jobOfferRepository.findAll().stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get jobs by enterprise
     */
    @Transactional
    public List<JobResponse> getEnterpriseJobs(String userId) {
        EnterpriseProfile enterprise = enterpriseProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Enterprise not found", 404));

        return jobOfferRepository.findByEnterpriseId(enterprise.getId()).stream()
                .map(JobResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a new job
     */
    @Transactional
    public JobResponse createJob(String userId, JobRequest request) {
        EnterpriseProfile enterprise = enterpriseProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("Enterprise profile not found", 404));

        JobOffer job = new JobOffer();
        job.setEnterprise(enterprise);
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setType(request.getType());
        job.setSalary(request.getSalary());
        job.setLocation(request.getLocation());
        job.setRequirements(matchingService.toJsonArray(request.getRequirements()));
        job.setStatus(JobStatus.ACTIVE);

        job = jobOfferRepository.save(job);
        return JobResponse.fromEntity(job);
    }

    /**
     * Update a job
     */
    @Transactional
    public JobResponse updateJob(String jobId, JobRequest request) {
        JobOffer job = jobOfferRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", 404));

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setType(request.getType());
        job.setSalary(request.getSalary());
        job.setLocation(request.getLocation());
        job.setRequirements(matchingService.toJsonArray(request.getRequirements()));

        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }

        job = jobOfferRepository.save(job);
        return JobResponse.fromEntity(job);
    }

    /**
     * Delete a job
     */
    @Transactional
    public void deleteJob(String jobId) {
        JobOffer job = jobOfferRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", 404));
        jobOfferRepository.delete(job);
    }

    /**
     * Update job status only
     */
    @Transactional
    public void updateJobStatus(String jobId, String status) {
        JobOffer job = jobOfferRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", 404));
        job.setStatus(JobStatus.valueOf(status));
        jobOfferRepository.save(job);
    }
}
