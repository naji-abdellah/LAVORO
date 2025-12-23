package com.recruitment.repository;

import com.recruitment.entity.Application;
import com.recruitment.enums.ApplicationStatus;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Application entity operations
 */
@ApplicationScoped
@Transactional
public class ApplicationRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public Application save(Application application) {
        if (application.getId() == null) {
            em.persist(application);
            return application;
        } else {
            return em.merge(application);
        }
    }

    public Optional<Application> findById(String id) {
        Application app = em.find(Application.class, id);
        return Optional.ofNullable(app);
    }

    public Optional<Application> findByIdWithDetails(String id) {
        try {
            Application app = em.createQuery(
                    "SELECT a FROM Application a " +
                            "JOIN FETCH a.candidate c " +
                            "JOIN FETCH c.user " +
                            "JOIN FETCH a.jobOffer j " +
                            "JOIN FETCH j.enterprise " +
                            "LEFT JOIN FETCH a.interview " +
                            "WHERE a.id = :id",
                    Application.class)
                    .setParameter("id", id)
                    .getSingleResult();
            return Optional.of(app);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public Optional<Application> findByCandidateAndJob(String candidateId, String jobId) {
        try {
            Application app = em.createQuery(
                    "SELECT a FROM Application a " +
                            "WHERE a.candidate.id = :candidateId AND a.jobOffer.id = :jobId",
                    Application.class)
                    .setParameter("candidateId", candidateId)
                    .setParameter("jobId", jobId)
                    .getSingleResult();
            return Optional.of(app);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public List<Application> findByCandidateId(String candidateId) {
        return em.createQuery(
                "SELECT a FROM Application a " +
                        "JOIN FETCH a.candidate c " +
                        "JOIN FETCH c.user " +
                        "JOIN FETCH a.jobOffer j " +
                        "JOIN FETCH j.enterprise e " +
                        "JOIN FETCH e.user " +
                        "LEFT JOIN FETCH a.interview " +
                        "WHERE a.candidate.id = :candidateId " +
                        "ORDER BY a.createdAt DESC",
                Application.class)
                .setParameter("candidateId", candidateId)
                .getResultList();
    }

    public List<Application> findByEnterpriseId(String enterpriseId) {
        return em.createQuery(
                "SELECT a FROM Application a " +
                        "JOIN FETCH a.candidate c " +
                        "JOIN FETCH c.user " +
                        "JOIN FETCH a.jobOffer j " +
                        "JOIN FETCH j.enterprise " +
                        "LEFT JOIN FETCH a.interview " +
                        "WHERE j.enterprise.id = :enterpriseId " +
                        "ORDER BY a.createdAt DESC",
                Application.class)
                .setParameter("enterpriseId", enterpriseId)
                .getResultList();
    }

    public List<Application> findByJobId(String jobId) {
        return em.createQuery(
                "SELECT a FROM Application a " +
                        "JOIN FETCH a.candidate c " +
                        "JOIN FETCH c.user " +
                        "LEFT JOIN FETCH a.interview " +
                        "WHERE a.jobOffer.id = :jobId " +
                        "ORDER BY a.createdAt DESC",
                Application.class)
                .setParameter("jobId", jobId)
                .getResultList();
    }

    public List<Application> findAll() {
        return em.createQuery(
                "SELECT a FROM Application a " +
                        "JOIN FETCH a.candidate c " +
                        "JOIN FETCH c.user " +
                        "JOIN FETCH a.jobOffer j " +
                        "JOIN FETCH j.enterprise " +
                        "LEFT JOIN FETCH a.interview " +
                        "ORDER BY a.createdAt DESC",
                Application.class)
                .getResultList();
    }

    public void delete(Application application) {
        em.remove(em.contains(application) ? application : em.merge(application));
    }

    public long countByCandidateId(String candidateId) {
        return em.createQuery(
                "SELECT COUNT(a) FROM Application a WHERE a.candidate.id = :candidateId", Long.class)
                .setParameter("candidateId", candidateId)
                .getSingleResult();
    }

    public long countByCandidateIdAndStatus(String candidateId, ApplicationStatus status) {
        return em.createQuery(
                "SELECT COUNT(a) FROM Application a " +
                        "WHERE a.candidate.id = :candidateId AND a.status = :status",
                Long.class)
                .setParameter("candidateId", candidateId)
                .setParameter("status", status)
                .getSingleResult();
    }

    public long countByEnterpriseId(String enterpriseId) {
        return em.createQuery(
                "SELECT COUNT(a) FROM Application a " +
                        "WHERE a.jobOffer.enterprise.id = :enterpriseId",
                Long.class)
                .setParameter("enterpriseId", enterpriseId)
                .getSingleResult();
    }

    public long countByEnterpriseIdAndStatus(String enterpriseId, ApplicationStatus status) {
        return em.createQuery(
                "SELECT COUNT(a) FROM Application a " +
                        "WHERE a.jobOffer.enterprise.id = :enterpriseId AND a.status = :status",
                Long.class)
                .setParameter("enterpriseId", enterpriseId)
                .setParameter("status", status)
                .getSingleResult();
    }

    public List<String> findAppliedJobIdsByCandidateId(String candidateId) {
        return em.createQuery(
                "SELECT a.jobOffer.id FROM Application a WHERE a.candidate.id = :candidateId",
                String.class)
                .setParameter("candidateId", candidateId)
                .getResultList();
    }

    public long count() {
        return em.createQuery(
                "SELECT COUNT(a) FROM Application a", Long.class)
                .getSingleResult();
    }
}
