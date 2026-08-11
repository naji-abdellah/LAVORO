package com.recruitment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for calculating skill matching scores
 */
@ApplicationScoped
public class MatchingService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Calculate matching score between candidate skills and job requirements
     * 
     * @return percentage match (0-100)
     */
    public double calculateMatchingScore(String candidateSkillsJson, String jobRequirementsJson) {
        List<String> candidateSkills = parseJsonArray(candidateSkillsJson);
        List<String> jobRequirements = parseJsonArray(jobRequirementsJson);

        if (jobRequirements.isEmpty()) {
            return 0;
        }

        // Normalize skills and requirements
        List<String> normalizedSkills = candidateSkills.stream()
                .map(s -> s.toLowerCase().trim())
                .toList();

        List<String> normalizedRequirements = jobRequirements.stream()
                .map(r -> r.toLowerCase().trim())
                .toList();

        // Count matches (partial matching allowed)
        long matchedCount = normalizedRequirements.stream()
                .filter(req -> normalizedSkills.stream()
                        .anyMatch(skill -> skill.contains(req) || req.contains(skill)))
                .count();

        return Math.round((double) matchedCount / jobRequirements.size() * 100);
    }

    /**
     * Parse JSON array string to List
     */
    private List<String> parseJsonArray(String json) {
        if (json == null || json.isEmpty() || json.equals("[]")) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (JsonProcessingException e) {
            // If not valid JSON, try to split by comma
            return List.of(json.split(",")).stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    /**
     * Convert comma-separated string to JSON array
     */
    public String toJsonArray(String commaSeparated) {
        if (commaSeparated == null || commaSeparated.isEmpty()) {
            return "[]";
        }
        List<String> items = List.of(commaSeparated.split(",")).stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        try {
            return objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}
