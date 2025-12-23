package com.recruitment.config;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

/**
 * CORS filter for cross-origin requests
 * Handles both preflight OPTIONS requests and regular cross-origin requests
 */
@Provider
@PreMatching
public class CorsFilter implements ContainerRequestFilter, ContainerResponseFilter {

        @Override
        public void filter(ContainerRequestContext requestContext) throws IOException {
                // Handle preflight OPTIONS requests
                if ("OPTIONS".equalsIgnoreCase(requestContext.getMethod())) {
                        requestContext.abortWith(Response.ok()
                                        .header("Access-Control-Allow-Origin", "*")
                                        .header("Access-Control-Allow-Credentials", "true")
                                        .header("Access-Control-Allow-Headers",
                                                        "origin, content-type, accept, authorization")
                                        .header("Access-Control-Allow-Methods",
                                                        "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD")
                                        .header("Access-Control-Max-Age", "86400")
                                        .build());
                }
        }

        @Override
        public void filter(ContainerRequestContext requestContext,
                        ContainerResponseContext responseContext) throws IOException {

                // Only add CORS headers if they haven't been added already
                if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Origin")) {
                        responseContext.getHeaders().add("Access-Control-Allow-Origin", "*");
                }
                if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Credentials")) {
                        responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
                }
                if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Headers")) {
                        responseContext.getHeaders().add("Access-Control-Allow-Headers",
                                        "origin, content-type, accept, authorization");
                }
                if (!responseContext.getHeaders().containsKey("Access-Control-Allow-Methods")) {
                        responseContext.getHeaders().add("Access-Control-Allow-Methods",
                                        "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
                }
        }
}
