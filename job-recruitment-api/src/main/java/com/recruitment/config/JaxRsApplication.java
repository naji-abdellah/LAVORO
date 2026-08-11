package com.recruitment.config;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

/**
 * JAX-RS Application configuration
 */
@ApplicationPath("/")
public class JaxRsApplication extends Application {
    // All resources are auto-discovered via CDI
}
