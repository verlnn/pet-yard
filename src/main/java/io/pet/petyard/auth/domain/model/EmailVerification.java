package io.pet.petyard.auth.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "email_verifications")
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String codeHash;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant verifiedAt;

    @Column(nullable = false)
    private int attemptCount;

    private Instant extendWindowStart;

    @Column(nullable = false)
    private int extendWindowCount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected EmailVerification() {
    }

    public EmailVerification(Long userId, String email, String codeHash, Instant expiresAt, Instant createdAt) {
        this.userId = userId;
        this.email = email;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.attemptCount = 0;
        this.extendWindowCount = 0;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExtendWindowStart() {
        return extendWindowStart;
    }

    public int getExtendWindowCount() {
        return extendWindowCount;
    }

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }

    public boolean isVerified() {
        return verifiedAt != null;
    }

    public void markVerified(Instant now) {
        this.verifiedAt = now;
    }

    public void incrementAttempt() {
        this.attemptCount += 1;
    }

    public boolean canExtend(Instant now, long windowMillis, int maxPerWindow) {
        if (extendWindowStart == null || now.isAfter(extendWindowStart.plusMillis(windowMillis))) {
            extendWindowStart = now;
            extendWindowCount = 0;
        }
        if (extendWindowCount >= maxPerWindow) {
            return false;
        }
        extendWindowCount += 1;
        return true;
    }

    public void extendExpiryTo(Instant newExpiry) {
        if (newExpiry.isAfter(this.expiresAt)) {
            this.expiresAt = newExpiry;
        }
    }
}
