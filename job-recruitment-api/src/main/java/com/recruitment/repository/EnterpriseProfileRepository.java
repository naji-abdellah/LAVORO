package com.recruitment.repository;

import com.recruitment.entity.EnterpriseProfile;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.Optional;

/**
 * Repository for EnterpriseProfile entity operations
 */
@ApplicationScoped
@Transactional
public class EnterpriseProfileRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public EnterpriseProfile save(EnterpriseProfile profile) {
        if (profile.getId() == null) {
            em.persist(profile);
            return profile;
        } else {
            return em.merge(profile);
        }
    }

    public Optional<EnterpriseProfile> findById(String id) {
        EnterpriseProfile profile = em.find(EnterpriseProfile.class, id);
        return Optional.ofNullable(profile);
    }

    public Optional<EnterpriseProfile> findByUserId(String userId) {
        try {
            EnterpriseProfile profile = em.createQuery(
                    "SELECT ep FROM EnterpriseProfile ep WHERE ep.user.id = :userId",
                    EnterpriseProfile.class)
                    .setParameter("userId", userId)
                    .getSingleResult();
            return Optional.of(profile);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public Optional<EnterpriseProfile> findByUserIdWithJobs(String userId) {
        try {
            EnterpriseProfile profile = em.createQuery(
                    "SELECT ep FROM EnterpriseProfile ep " +
                            "LEFT JOIN FETCH ep.jobOffers " +
                            "WHERE ep.user.id = :userId",
                    EnterpriseProfile.class)
                    .setParameter("userId", userId)
                    .getSingleResult();
            return Optional.of(profile);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public void delete(EnterpriseProfile profile) {
        em.remove(em.contains(profile) ? profile : em.merge(profile));
    }

    public long count() {
        return em.createQuery(
                "SELECT COUNT(ep) FROM EnterpriseProfile ep", Long.class)
                .getSingleResult();
    }
}
