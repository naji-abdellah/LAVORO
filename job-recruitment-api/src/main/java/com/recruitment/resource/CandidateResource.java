package com.recruitment.resource;

import com.recruitment.dto.response.ApplicationResponse;
import com.recruitment.dto.response.DashboardStatsResponse;
import com.recruitment.security.Secured;
import com.recruitment.security.RolesAllowed;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.UserService;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;
import java.util.Map;

/**
 * REST resource for candidate endpoints
 */
@Path("/api/candidate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
@Secured
@RolesAllowed("CANDIDATE")
public class CandidateResource {

    @Inject
    private ApplicationService applicationService;

    @Inject
    private UserService userService;

    // ===== Dashboard =====

    @GET
    @Path("/dashboard")
    public Response getDashboardStats(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        DashboardStatsResponse stats = userService.getCandidateDashboardStats(principal.getUserId());
        return Response.ok(stats).build();
    }

    // ===== Applications =====

    @GET
    @Path("/applications")
    public Response getApplications(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        List<ApplicationResponse> applications = applicationService.getCandidateApplications(principal.getUserId());
        return Response.ok(Map.of("applications", applications)).build();
    }
}
