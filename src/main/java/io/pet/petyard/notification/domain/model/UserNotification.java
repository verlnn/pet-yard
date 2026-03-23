package io.pet.petyard.notification.domain.model;

import io.pet.petyard.notification.domain.NotificationStatus;
import io.pet.petyard.notification.domain.NotificationType;
import java.time.Instant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_notifications", schema = "auth")
public class UserNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long recipientUserId;

    @Column(nullable = false)
    private Long actorUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant readAt;

    private Instant actedAt;

    protected UserNotification() {
    }

    public UserNotification(Long recipientUserId, Long actorUserId, NotificationType type) {
        this.recipientUserId = recipientUserId;
        this.actorUserId = actorUserId;
        this.type = type;
        this.status = NotificationStatus.UNREAD;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getRecipientUserId() {
        return recipientUserId;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public Instant getActedAt() {
        return actedAt;
    }

    public boolean isActionableGuardianRequest() {
        return type == NotificationType.GUARDIAN_REQUEST && (status == NotificationStatus.UNREAD || status == NotificationStatus.READ);
    }

    public void markRead() {
        if (status == NotificationStatus.UNREAD) {
            status = NotificationStatus.READ;
            readAt = Instant.now();
        }
    }

    public void markAccepted() {
        status = NotificationStatus.ACCEPTED;
        actedAt = Instant.now();
    }

    public void markRejected() {
        status = NotificationStatus.REJECTED;
        actedAt = Instant.now();
    }

    public void markCanceled() {
        status = NotificationStatus.CANCELED;
        actedAt = Instant.now();
    }
}
