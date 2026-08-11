package com.recruitment.resource;

import com.recruitment.dto.request.ApplicationStatusRequest;
import com.recruitment.dto.request.InterviewRequest;
import com.recruitment.dto.request.JobRequest;
import com.recruitment.dto.response.ApplicationResponse;
import com.recruitment.dto.response.DashboardStatsResponse;
import com.recruitment.dto.response.InterviewResponse;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.repository.EnterpriseProfileRepository;
import com.recruitment.security.Secured;
import com.recruitment.security.RolesAllowed;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.InterviewService;
import com.recruitment.service.JobService;
import com.recruitment.service.UserService;
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
 * REST resource for enterprise endpoints
 */
@Path("/api/enterprise")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
@Secured
@RolesAllowed("ENTERPRISE")
public class EnterpriseResource {

    @Inject
    private JobService jobService;

    @Inject
    private ApplicationService applicationService;

    @Inject
    private InterviewService interviewService;

    @Inject
    private UserService userService;

    @Inject
    private EnterpriseProfileRepository enterpriseProfileRepository;

    // ===== Dashboard =====

    @GET
    @Path("/dashboard")
    public Response getDashboardStats(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        DashboardStatsResponse stats = userService.getEnterpriseDashboardStats(principal.getUserId());
        return Response.ok(stats).build();
    }

    // ===== Profile =====

    @GET
    @Path("/profile")
    public Response getProfile(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        var enterprise = enterpriseProfileRepository.findByUserId(principal.getUserId());
        if (enterprise.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Enterprise profile not found")).build();
        }

        var profile = enterprise.get();
        return Response.ok(Map.of("profile", Map.of(
                "id", profile.getId(),
                "companyName", profile.getCompanyName() != null ? profile.getCompanyName() : "",
                "description", profile.getDescription() != null ? profile.getDescription() : "",
                "industry", profile.getIndustry() != null ? profile.getIndustry() : "",
                "location", profile.getLocation() != null ? profile.getLocation() : "",
                "logoUrl", profile.getLogoUrl() != null ? profile.getLogoUrl() : ""))).build();
    }

    @PUT
    @Path("/profile")
    public Response updateProfile(Map<String, String> request, @Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        var enterprise = enterpriseProfileRepository.findByUserId(principal.getUserId());
        if (enterprise.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Enterprise profile not found")).build();
        }

        var profile = enterprise.get();
        if (request.containsKey("companyName")) {
            profile.setCompanyName(request.get("companyName"));
        }
        if (request.containsKey("description")) {
            profile.setDescription(request.get("description"));
        }
        if (request.containsKey("industry")) {
            profile.setIndustry(request.get("industry"));
        }
        if (request.containsKey("location")) {
            profile.setLocation(request.get("location"));
        }
        if (request.containsKey("logoUrl")) {
            profile.setLogoUrl(request.get("logoUrl"));
        }

        enterpriseProfileRepository.save(profile);
        return Response.ok(Map.of("success", true)).build();
    }

    // ===== Jobs =====

    @GET
    @Path("/jobs")
    public Response getJobs(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        List<JobResponse> jobs = jobService.getEnterpriseJobs(principal.getUserId());
        return Response.ok(Map.of("jobs", jobs)).build();
    }

    @POST
    @Path("/jobs")
    public Response createJob(@Valid JobRequest request, @Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        JobResponse job = jobService.createJob(principal.getUserId(), request);
        return Response.status(Response.Status.CREATED).entity(Map.of("success", true, "jobId", job.getId())).build();
    }

    @PUT
    @Path("/jobs/{id}")
    public Response updateJob(@PathParam("id") String id, @Valid JobRequest request) {
        JobResponse job = jobService.updateJob(id, request);
        return Response.ok(Map.of("success", true)).build();
    }

    @DELETE
    @Path("/jobs/{id}")
    public Response deleteJob(@PathParam("id") String id) {
        jobService.deleteJob(id);
        return Response.ok(Map.of("success", true)).build();
    }

    @PATCH
    @Path("/jobs/{id}/status")
    public Response toggleJobStatus(@PathParam("id") String id, Map<String, String> request) {
        String newStatus = request.get("status");
        jobService.updateJobStatus(id, newStatus);
        return Response.ok(Map.of("success", true)).build();
    }

    // ===== Applications =====

    @GET
    @Path("/applications")
    public Response getApplications(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        var enterprise = enterpriseProfileRepository.findByUserId(principal.getUserId());
        if (enterprise.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("error", "Enterprise not found")).build();
        }

        List<ApplicationResponse> applications = applicationService.getEnterpriseApplications(enterprise.get().getId());
        return Response.ok(Map.of("applications", applications)).build();
    }

    @PUT
    @Path("/applications")
    public Response updateApplicationStatus(@Valid ApplicationStatusRequest request) {
        applicationService.updateStatus(request.getApplicationId(), request.getStatus());
        return Response.ok(Map.of("success", true)).build();
    }

    // ===== Interviews =====

    @POST
    @Path("/applications/interview")
    public Response scheduleInterview(@Valid InterviewRequest request) {
        InterviewResponse interview = interviewService.scheduleInterview(request);
        return Response.ok(Map.of("success", true)).build();
    }
}
