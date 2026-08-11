package com.recruitment.config;

import com.recruitment.security.RolesAllowed;
import com.recruitment.security.Secured;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.JwtTokenService;
import io.jsonwebtoken.Claims;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.lang.reflect.Method;
import java.security.Principal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * JWT Authentication filter for secured endpoints
 */
@Provider
@Secured
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthenticationFilter implements ContainerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    @Inject
    private JwtTokenService jwtTokenService;

    @Context
    private ResourceInfo resourceInfo;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        // Get Authorization header
        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            requestContext.abortWith(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("{\"error\": \"Missing or invalid Authorization header\"}")
                            .build());
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            // Validate token
            Claims claims = jwtTokenService.validateToken(token);

            String userId = claims.getSubject();
            String email = claims.get("email", String.class);
            String role = claims.get("role", String.class);

            // Check roles if @RolesAllowed is present
            Set<String> allowedRoles = getAllowedRoles();
            if (!allowedRoles.isEmpty() && !allowedRoles.contains(role)) {
                requestContext.abortWith(
                        Response.status(Response.Status.FORBIDDEN)
                                .entity("{\"error\": \"Access denied\"}")
                                .build());
                return;
            }

            // Set security context
            UserPrincipal userPrincipal = new UserPrincipal(userId, email, role);
            requestContext.setSecurityContext(new SecurityContext() {
                @Override
                public Principal getUserPrincipal() {
                    return userPrincipal;
                }

                @Override
                public boolean isUserInRole(String r) {
                    return role.equals(r);
                }

                @Override
                public boolean isSecure() {
                    return requestContext.getSecurityContext().isSecure();
                }

                @Override
                public String getAuthenticationScheme() {
                    return "Bearer";
                }
            });

        } catch (Exception e) {
            requestContext.abortWith(
                    Response.status(Response.Status.UNAUTHORIZED)
                            .entity("{\"error\": \"Invalid or expired token\"}")
                            .build());
        }
    }

    private Set<String> getAllowedRoles() {
        Set<String> roles = new HashSet<>();

        // Check method-level annotation first
        Method method = resourceInfo.getResourceMethod();
        if (method != null && method.isAnnotationPresent(RolesAllowed.class)) {
            roles.addAll(Arrays.asList(method.getAnnotation(RolesAllowed.class).value()));
        }

        // Check class-level annotation if method doesn't have one
        if (roles.isEmpty()) {
            Class<?> resourceClass = resourceInfo.getResourceClass();
            if (resourceClass != null && resourceClass.isAnnotationPresent(RolesAllowed.class)) {
                roles.addAll(Arrays.asList(resourceClass.getAnnotation(RolesAllowed.class).value()));
            }
        }

        return roles;
    }
}
