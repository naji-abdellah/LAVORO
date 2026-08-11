package com.recruitment.repository;

import com.recruitment.entity.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity operations
 */
@ApplicationScoped
@Transactional
public class UserRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public User save(User user) {
        if (user.getId() == null) {
            em.persist(user);
            return user;
        } else {
            return em.merge(user);
        }
    }

    public Optional<User> findById(String id) {
        User user = em.find(User.class, id);
        return Optional.ofNullable(user);
    }

    public Optional<User> findByEmail(String email) {
        try {
            User user = em.createQuery(
                    "SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", email)
                    .getSingleResult();
            return Optional.of(user);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByEmailWithProfiles(String email) {
        try {
            User user = em.createQuery(
                    "SELECT u FROM User u " +
                            "LEFT JOIN FETCH u.candidateProfile " +
                            "LEFT JOIN FETCH u.enterpriseProfile " +
                            "WHERE u.email = :email",
                    User.class)
                    .setParameter("email", email)
                    .getSingleResult();
            return Optional.of(user);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByIdWithProfiles(String id) {
        try {
            User user = em.createQuery(
                    "SELECT u FROM User u " +
                            "LEFT JOIN FETCH u.candidateProfile " +
                            "LEFT JOIN FETCH u.enterpriseProfile " +
                            "WHERE u.id = :id",
                    User.class)
                    .setParameter("id", id)
                    .getSingleResult();
            return Optional.of(user);
        } catch (NoResultException e) {
            return Optional.empty();
        }
    }

    public List<User> findAll() {
        return em.createQuery(
                "SELECT u FROM User u ORDER BY u.createdAt DESC", User.class)
                .getResultList();
    }

    public List<User> findAllWithProfiles() {
        return em.createQuery(
                "SELECT DISTINCT u FROM User u " +
                        "LEFT JOIN FETCH u.candidateProfile " +
                        "LEFT JOIN FETCH u.enterpriseProfile " +
                        "ORDER BY u.createdAt DESC",
                User.class)
                .getResultList();
    }

    public void delete(User user) {
        em.remove(em.contains(user) ? user : em.merge(user));
    }

    public void deleteById(String id) {
        findById(id).ifPresent(this::delete);
    }

    public boolean existsByEmail(String email) {
        Long count = em.createQuery(
                "SELECT COUNT(u) FROM User u WHERE u.email = :email", Long.class)
                .setParameter("email", email)
                .getSingleResult();
        return count > 0;
    }

    public long count() {
        return em.createQuery(
                "SELECT COUNT(u) FROM User u", Long.class)
                .getSingleResult();
    }

    public List<User> findRecentUsers(int limit) {
        return em.createQuery(
                "SELECT DISTINCT u FROM User u " +
                        "LEFT JOIN FETCH u.candidateProfile " +
                        "LEFT JOIN FETCH u.enterpriseProfile " +
                        "WHERE u.role != 'ADMIN' " +
                        "ORDER BY u.createdAt DESC",
                User.class)
                .setMaxResults(limit)
                .getResultList();
    }
}
