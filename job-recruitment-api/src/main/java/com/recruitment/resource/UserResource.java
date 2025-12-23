package com.recruitment.resource;

import com.recruitment.dto.response.UserResponse;
import com.recruitment.security.Secured;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.UserService;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.Map;

/**
 * REST resource for user info endpoints
 */
@Path("/api/user")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
@Secured
public class UserResource {

    @Inject
    private UserService userService;

    /**
     * Get current user info
     */
    @GET
    @Path("/info")
    public Response getUserInfo(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        UserResponse user = userService.getUserById(principal.getUserId());
        return Response.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "isActive", user.isActive())).build();
    }
}
