package com.recruitment.resource;

import com.recruitment.dto.request.UserStatusRequest;
import com.recruitment.dto.response.ApplicationResponse;
import com.recruitment.dto.response.InterviewResponse;
import com.recruitment.dto.response.JobResponse;
import com.recruitment.dto.response.UserResponse;
import com.recruitment.security.Secured;
import com.recruitment.security.RolesAllowed;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.InterviewService;
import com.recruitment.service.JobService;
import com.recruitment.service.UserService;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

/**
 * REST resource for admin endpoints
 */
@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
@Secured
@RolesAllowed("ADMIN")
public class AdminResource {

    @Inject
    private UserService userService;

    @Inject
    private JobService jobService;

    @Inject
    private ApplicationService applicationService;

    @Inject
    private InterviewService interviewService;

    // ===== Dashboard =====

    @GET
    @Path("/dashboard")
    public Response getDashboard() {
        long totalUsers = userService.getUserCount();
        long candidateCount = userService.getCandidateCount();
        long enterpriseCount = userService.getEnterpriseCount();
        long jobCount = jobService.getJobCount();
        long applicationCount = applicationService.getApplicationCount();
        List<UserResponse> recentUsers = userService.getRecentUsers(5);

        return Response.ok(Map.of(
                "totalUsers", totalUsers,
                "totalCandidates", candidateCount,
                "totalEnterprises", enterpriseCount,
                "activeJobs", jobCount,
                "totalApplications", applicationCount,
                "recentUsers", recentUsers)).build();
    }

    // ===== Users =====

    @GET
    @Path("/users")
    public Response getUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return Response.ok(Map.of("users", users)).build();
    }

    @GET
    @Path("/users/{id}")
    public Response getUser(@PathParam("id") String id) {
        var data = userService.getUserDetails(id);
        return Response.ok(data).build();
    }

    @PATCH
    @Path("/users")
    public Response updateUserStatus(UserStatusRequest request) {
        userService.updateUserStatus(request);
        return Response.ok(Map.of("success", true)).build();
    }

    @DELETE
    @Path("/users/{id}")
    public Response deleteUser(@PathParam("id") String id) {
        userService.deleteUser(id);
        return Response.ok(Map.of("success", true)).build();
    }

    // ===== Jobs =====

    @GET
    @Path("/jobs")
    public Response getJobs() {
        List<JobResponse> jobs = jobService.getAllJobs();
        return Response.ok(Map.of("jobs", jobs)).build();
    }

    @DELETE
    @Path("/jobs/{id}")
    public Response deleteJob(@PathParam("id") String id) {
        jobService.deleteJob(id);
        return Response.ok(Map.of("success", true)).build();
    }

    // ===== Applications =====

    @GET
    @Path("/applications")
    public Response getApplications() {
        List<ApplicationResponse> applications = applicationService.getAllApplications();
        return Response.ok(Map.of("applications", applications)).build();
    }

    @PATCH
    @Path("/applications")
    public Response updateApplication(Map<String, Object> request) {
        String applicationId = (String) request.get("applicationId");

        if (request.containsKey("status")) {
            String status = (String) request.get("status");
            applicationService.updateApplicationStatus(applicationId, status);
        }

        if (request.containsKey("isAnonymous")) {
            boolean isAnonymous = (Boolean) request.get("isAnonymous");
            applicationService.updateApplicationAnonymity(applicationId, isAnonymous);
        }

        return Response.ok(Map.of("success", true)).build();
    }

    @DELETE
    @Path("/applications/{id}")
    public Response deleteApplication(@PathParam("id") String id) {
        applicationService.deleteApplication(id);
        return Response.ok(Map.of("success", true)).build();
    }

    // ===== Interviews =====

    @GET
    @Path("/interviews")
    public Response getInterviews() {
        List<InterviewResponse> interviews = interviewService.getAllInterviews();
        return Response.ok(Map.of("interviews", interviews)).build();
    }
}
