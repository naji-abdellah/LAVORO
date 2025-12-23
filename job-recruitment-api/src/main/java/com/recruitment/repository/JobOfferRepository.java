package com.recruitment.repository;

import com.recruitment.entity.JobOffer;
import com.recruitment.enums.JobStatus;
import com.recruitment.enums.JobType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Repository for JobOffer entity operations
 */
@ApplicationScoped
@Transactional
public class JobOfferRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public JobOffer save(JobOffer jobOffer) {
        if (jobOffer.getId() == null) {
            em.persist(jobOffer);
            return jobOffer;
        } else {
            return em.merge(jobOffer);
        }
    }

    public Optional<JobOffer> findById(String id) {
        JobOffer job = em.find(JobOffer.class, id);
        return Optional.ofNullable(job);
    }

    public Optional<JobOffer> findByIdWithEnterprise(String id) {
        try {
            JobOffer job = em.createQuery(
                    "SELECT j FROM JobOffer j " +
                            "JOIN FETCH j.enterprise " +
                            "WHERE j.id = :id",
                    JobOffer.class)
                    .setParameter("id", id)
                    .getSingleResult();
            return Optional.of(job);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<JobOffer> findActiveById(String id) {
        try {
            JobOffer job = em.createQuery(
                    "SELECT j FROM JobOffer j " +
                            "JOIN FETCH j.enterprise " +
                            "WHERE j.id = :id AND j.status = :status",
                    JobOffer.class)
                    .setParameter("id", id)
                    .setParameter("status", JobStatus.ACTIVE)
                    .getSingleResult();
            return Optional.of(job);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public List<JobOffer> findAll() {
        return em.createQuery(
                "SELECT j FROM JobOffer j " +
                        "JOIN FETCH j.enterprise " +
                        "ORDER BY j.createdAt DESC",
                JobOffer.class)
                .getResultList();
    }

    public List<JobOffer> findActiveJobs(JobType type, String location, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT DISTINCT j FROM JobOffer j " +
                        "JOIN FETCH j.enterprise " +
                        "WHERE j.status = :status");

        if (type != null) {
            jpql.append(" AND j.type = :type");
        }
        if (location != null && !location.isEmpty()) {
            jpql.append(" AND LOWER(j.location) LIKE LOWER(:location)");
        }
        if (search != null && !search.isEmpty()) {
            jpql.append(" AND (LOWER(j.title) LIKE LOWER(:search) OR LOWER(j.description) LIKE LOWER(:search))");
        }
        jpql.append(" ORDER BY j.createdAt DESC");

        TypedQuery<JobOffer> query = em.createQuery(jpql.toString(), JobOffer.class)
                .setParameter("status", JobStatus.ACTIVE);

        if (type != null) {
            query.setParameter("type", type);
        }
        if (location != null && !location.isEmpty()) {
            query.setParameter("location", "%" + location + "%");
        }
        if (search != null && !search.isEmpty()) {
            query.setParameter("search", "%" + search + "%");
        }

        return query.getResultList();
    }

    public List<JobOffer> findByEnterpriseId(String enterpriseId) {
        return em.createQuery(
                "SELECT j FROM JobOffer j " +
                        "WHERE j.enterprise.id = :enterpriseId " +
                        "ORDER BY j.createdAt DESC",
                JobOffer.class)
                .setParameter("enterpriseId", enterpriseId)
                .getResultList();
    }

    public void delete(JobOffer jobOffer) {
        em.remove(em.contains(jobOffer) ? jobOffer : em.merge(jobOffer));
    }

    public void deleteById(String id) {
        findById(id).ifPresent(this::delete);
    }

    public long countByEnterpriseId(String enterpriseId) {
        return em.createQuery(
                "SELECT COUNT(j) FROM JobOffer j " +
                        "WHERE j.enterprise.id = :enterpriseId",
                Long.class)
                .setParameter("enterpriseId", enterpriseId)
                .getSingleResult();
    }

    public long countByEnterpriseIdAndStatus(String enterpriseId, JobStatus status) {
        return em.createQuery(
                "SELECT COUNT(j) FROM JobOffer j " +
                        "WHERE j.enterprise.id = :enterpriseId AND j.status = :status",
                Long.class)
                .setParameter("enterpriseId", enterpriseId)
                .setParameter("status", status)
                .getSingleResult();
    }

    public long count() {
        return em.createQuery(
                "SELECT COUNT(j) FROM JobOffer j", Long.class)
                .getSingleResult();
    }
}
