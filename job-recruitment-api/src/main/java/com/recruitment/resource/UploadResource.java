package com.recruitment.resource;

import com.recruitment.security.Secured;
import com.recruitment.security.UserPrincipal;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * REST resource for file upload endpoints
 */
@Path("/api/upload")
@RequestScoped
@Secured
public class UploadResource {

    @Inject
    @ConfigProperty(name = "upload.path", defaultValue = "/uploads")
    private String uploadPath;

    /**
     * Upload photo
     */
    @POST
    @Path("/photo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadPhoto(
            @FormParam("file") InputStream fileStream,
            @FormParam("fileName") String fileName,
            @Context SecurityContext securityContext) {

        try {
            UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
            String savedPath = saveFile(fileStream, fileName, "photos", principal.getUserId());
            return Response.ok(Map.of("success", true, "url", savedPath)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to upload file"))
                    .build();
        }
    }

    /**
     * Upload CV (for candidates)
     */
    @POST
    @Path("/cv")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadCV(
            @FormParam("file") InputStream fileStream,
            @FormParam("fileName") String fileName,
            @Context SecurityContext securityContext) {

        try {
            UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
            if (!"CANDIDATE".equals(principal.getRole())) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Only candidates can upload CVs"))
                        .build();
            }

            String savedPath = saveFile(fileStream, fileName, "cvs", principal.getUserId());
            return Response.ok(Map.of("success", true, "url", savedPath)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to upload file"))
                    .build();
        }
    }

    /**
     * Upload logo (for enterprises)
     */
    @POST
    @Path("/logo")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadLogo(
            @FormParam("file") InputStream fileStream,
            @FormParam("fileName") String fileName,
            @Context SecurityContext securityContext) {

        try {
            UserPrincipal principal = (UserPrincipal) securityContext.getUserPrincipal();
            if (!"ENTERPRISE".equals(principal.getRole())) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Only enterprises can upload logos"))
                        .build();
            }

            String savedPath = saveFile(fileStream, fileName, "logos", principal.getUserId());
            return Response.ok(Map.of("success", true, "url", savedPath)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to upload file"))
                    .build();
        }
    }

    private String saveFile(InputStream fileStream, String originalFileName, String subDir, String userId)
            throws IOException {
        // Create directory if it doesn't exist
        java.nio.file.Path dirPath = Paths.get(uploadPath, subDir);
        Files.createDirectories(dirPath);

        // Generate unique filename
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String newFileName = userId + "_" + UUID.randomUUID().toString() + extension;

        java.nio.file.Path filePath = dirPath.resolve(newFileName);

        // Save file
        Files.copy(fileStream, filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return "/" + subDir + "/" + newFileName;
    }
}
