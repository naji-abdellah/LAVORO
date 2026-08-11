package com.recruitment.resource;

import com.recruitment.dto.response.NotificationResponse;
import com.recruitment.security.Secured;
import com.recruitment.security.UserPrincipal;
import com.recruitment.service.NotificationService;
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
 * REST resource for notification endpoints
 */
@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
@Secured
public class NotificationResource {

    @Inject
    private NotificationService notificationService;

    /**
     * Get notifications for current user
     */
    @GET
    public Response getNotifications(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        List<NotificationResponse> notifications = notificationService.getNotifications(principal.getUserId(), 20);
        long unreadCount = notificationService.getUnreadCount(principal.getUserId());
        return Response.ok(Map.of("notifications", notifications, "unreadCount", unreadCount)).build();
    }

    /**
     * Mark notification as read
     */
    @PUT
    @Path("/{id}/read")
    public Response markAsRead(@PathParam("id") String id) {
        notificationService.markAsRead(id);
        return Response.ok(Map.of("success", true)).build();
    }

    /**
     * Mark all notifications as read
     */
    @PUT
    @Path("/read-all")
    public Response markAllAsRead(@Context SecurityContext securityContext) {
        UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
        notificationService.markAllAsRead(principal.getUserId());
        return Response.ok(Map.of("success", true)).build();
    }
}
