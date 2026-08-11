package com.recruitment.repository;

import com.recruitment.entity.CandidateProfile;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.Optional;

/**
 * Repository for CandidateProfile entity operations
 */
@ApplicationScoped
@Transactional
public class CandidateProfileRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public CandidateProfile save(CandidateProfile profile) {
        if (profile.getId() == null) {
            em.persist(profile);
            return profile;
        } else {
            return em.merge(profile);
        }
    }

    public Optional<CandidateProfile> findById(String id) {
        CandidateProfile profile = em.find(CandidateProfile.class, id);
        return Optional.ofNullable(profile);
    }

    public Optional<CandidateProfile> findByUserId(String userId) {
        try {
            CandidateProfile profile = em.createQuery(
                    "SELECT cp FROM CandidateProfile cp WHERE cp.user.id = :userId",
                    CandidateProfile.class)
                    .setParameter("userId", userId)
                    .getSingleResult();
            return Optional.of(profile);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public Optional<CandidateProfile> findByUserIdWithApplications(String userId) {
        try {
            CandidateProfile profile = em.createQuery(
                    "SELECT cp FROM CandidateProfile cp " +
                            "LEFT JOIN FETCH cp.applications a " +
                            "LEFT JOIN FETCH a.jobOffer " +
                            "WHERE cp.user.id = :userId",
                    CandidateProfile.class)
                    .setParameter("userId", userId)
                    .getSingleResult();
            return Optional.of(profile);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public void delete(CandidateProfile profile) {
        em.remove(em.contains(profile) ? profile : em.merge(profile));
    }

    public long count() {
        return em.createQuery(
                "SELECT COUNT(cp) FROM CandidateProfile cp", Long.class)
                .getSingleResult();
    }
}
