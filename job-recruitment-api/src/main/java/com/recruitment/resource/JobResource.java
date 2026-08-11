package com.recruitment.resource;

import com.recruitment.dto.request.ApplyRequest;
import com.recruitment.dto.response.ApplicationResponse;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.repository.CandidateProfileRepository;
import com.recruitment.security.Secured;
import com.recruitment.security.RolesAllowed;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.JobService;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;
import java.util.Map;

/**
 * REST resource for public job endpoints
 */
@Path("/api/jobs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
public class JobResource {

    @Inject
    private JobService jobService;

    @Inject
    private ApplicationService applicationService;

    @Inject
    private CandidateProfileRepository candidateProfileRepository;

    /**
     * Get all active jobs with optional filters
     */
    @GET
    public Response getJobs(
            @QueryParam("type") String type,
            @QueryParam("location") String location,
            @QueryParam("search") String search,
            @Context SecurityContext securityContext) {

        String candidateId = null;
        if (securityContext.getUserPrincipal() != null) {
            UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
            if ("CANDIDATE".equals(principal.getRole())) {
                candidateProfileRepository.findByUserId(principal.getUserId())
                        .ifPresent(profile -> {
                        });
                var profile = candidateProfileRepository.findByUserId(principal.getUserId());
                if (profile.isPresent()) {
                    candidateId = profile.get().getId();
                }
            }
        }

        List<JobResponse> jobs = jobService.getActiveJobs(type, location, search, candidateId);
        return Response.ok(Map.of("jobs", jobs)).build();
    }

    /**
     * Get job by ID
     */
    @GET
    @Path("/{id}")
    public Response getJob(@PathParam("id") String id) {
        JobResponse job = jobService.getJobById(id);
        return Response.ok(Map.of("job", job)).build();
    }

    /**
     * Apply to a job
     */
    @POST
    @Path("/apply")
    @Secured
    @RolesAllowed("CANDIDATE")
    public Response applyToJob(@Valid ApplyRequest request, @Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        ApplicationResponse result = applicationService.apply(principal.getUserId(), request.getJobId());
        return Response.ok(Map.of("success", true, "matchingScore", result.getMatchingScore())).build();
    }
}
