package io.pet.petyard.user.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected GuardianRegistration() {
    }

    public GuardianRegistration(Long guardianUserId, Long targetUserId) {
        this.guardianUserId = guardianUserId;
        this.targetUserId = targetUserId;
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
}
