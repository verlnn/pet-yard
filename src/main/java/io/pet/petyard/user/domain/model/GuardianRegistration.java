package io.pet.petyard.user.domain.model;

import io.pet.petyard.user.domain.GuardianRegistrationStatus;

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
@Table(name = "guardian_registrations", schema = "auth")
public class GuardianRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long guardianUserId;

    @Column(nullable = false)
    private Long targetUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GuardianRegistrationStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant respondedAt;

    protected GuardianRegistration() {
    }

    public GuardianRegistration(Long guardianUserId, Long targetUserId) {
        this.guardianUserId = guardianUserId;
        this.targetUserId = targetUserId;
        this.status = GuardianRegistrationStatus.REQUESTED;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getGuardianUserId() {
        return guardianUserId;
    }

    public Long getTargetUserId() {
        return targetUserId;
    }

    public GuardianRegistrationStatus getStatus() {
        return status;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public boolean isAccepted() {
        return status == GuardianRegistrationStatus.ACCEPTED;
    }

    public boolean isRequestedBy(Long userId) {
        return guardianUserId.equals(userId) && status == GuardianRegistrationStatus.REQUESTED;
    }

    public boolean isRequestedFor(Long userId) {
        return targetUserId.equals(userId) && status == GuardianRegistrationStatus.REQUESTED;
    }

    public void accept() {
        this.status = GuardianRegistrationStatus.ACCEPTED;
        this.respondedAt = Instant.now();
    }
}
