package com.recruitment.repository;

import com.recruitment.entity.Interview;
import com.recruitment.enums.InterviewStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Interview entity operations
 */
@ApplicationScoped
@Transactional
public class InterviewRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public Interview save(Interview interview) {
        if (interview.getId() == null) {
            em.persist(interview);
            return interview;
        } else {
            return em.merge(interview);
        }
    }

    public Optional<Interview> findById(String id) {
        Interview interview = em.find(Interview.class, id);
        return Optional.ofNullable(interview);
    }

    public Optional<Interview> findByApplicationId(String applicationId) {
        try {
            Interview interview = em.createQuery(
                    "SELECT i FROM Interview i WHERE i.application.id = :applicationId",
                    Interview.class)
                    .setParameter("applicationId", applicationId)
                    .getSingleResult();
            return Optional.of(interview);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public List<Interview> findUpcomingByCandidateId(String candidateId, int limit) {
        return em.createQuery(
                "SELECT i FROM Interview i " +
                        "JOIN FETCH i.application a " +
                        "JOIN FETCH a.jobOffer j " +
                        "JOIN FETCH j.enterprise " +
                        "WHERE a.candidate.id = :candidateId " +
                        "AND i.date >= :now " +
                        "AND i.status = :status " +
                        "ORDER BY i.date ASC",
                Interview.class)
                .setParameter("candidateId", candidateId)
                .setParameter("now", LocalDateTime.now())
                .setParameter("status", InterviewStatus.SCHEDULED)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<Interview> findAll() {
        return em.createQuery(
                "SELECT i FROM Interview i " +
                        "JOIN FETCH i.application a " +
                        "JOIN FETCH a.candidate " +
                        "JOIN FETCH a.jobOffer " +
                        "ORDER BY i.date DESC",
                Interview.class)
                .getResultList();
    }

    public List<Interview> findAllWithDetails() {
        return em.createQuery(
                "SELECT i FROM Interview i " +
                        "JOIN FETCH i.application a " +
                        "JOIN FETCH a.candidate c " +
                        "JOIN FETCH c.user " +
                        "JOIN FETCH a.jobOffer j " +
                        "JOIN FETCH j.enterprise e " +
                        "JOIN FETCH e.user " +
                        "ORDER BY i.date DESC",
                Interview.class)
                .getResultList();
    }

    public void delete(Interview interview) {
        em.remove(em.contains(interview) ? interview : em.merge(interview));
    }
}
