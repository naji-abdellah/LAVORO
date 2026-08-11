package com.recruitment.repository;

import com.recruitment.entity.Notification;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Notification entity operations
 */
@ApplicationScoped
@Transactional
public class NotificationRepository {

    @PersistenceContext(unitName = "recruitmentPU")
    private EntityManager em;

    public Notification save(Notification notification) {
        if (notification.getId() == null) {
            em.persist(notification);
            return notification;
        } else {
            return em.merge(notification);
        }
    }

    public Optional<Notification> findById(String id) {
        Notification notification = em.find(Notification.class, id);
        return Optional.ofNullable(notification);
    }

    public List<Notification> findByUserId(String userId, int limit) {
        return em.createQuery(
                "SELECT n FROM Notification n " +
                        "WHERE n.user.id = :userId " +
                        "ORDER BY n.createdAt DESC",
                Notification.class)
                .setParameter("userId", userId)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<Notification> findUnreadByUserId(String userId) {
        return em.createQuery(
                "SELECT n FROM Notification n " +
                        "WHERE n.user.id = :userId AND n.read = false " +
                        "ORDER BY n.createdAt DESC",
                Notification.class)
                .setParameter("userId", userId)
                .getResultList();
    }

    public long countUnreadByUserId(String userId) {
        return em.createQuery(
                "SELECT COUNT(n) FROM Notification n " +
                        "WHERE n.user.id = :userId AND n.read = false",
                Long.class)
                .setParameter("userId", userId)
                .getSingleResult();
    }

    public void markAsRead(String notificationId) {
        em.createQuery(
                "UPDATE Notification n SET n.read = true WHERE n.id = :id")
                .setParameter("id", notificationId)
                .executeUpdate();
    }

    public void markAllAsReadByUserId(String userId) {
        em.createQuery(
                "UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
                .setParameter("userId", userId)
                .executeUpdate();
    }

    public void delete(Notification notification) {
        em.remove(em.contains(notification) ? notification : em.merge(notification));
    }
}
