package io.pet.petyard.onboarding.domain.model;

import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.onboarding.domain.SignupStatus;
import io.pet.petyard.onboarding.domain.SignupStep;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "signup_sessions")
public class SignupSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    @Column(nullable = false)
    private String state;

    private String sessionToken;

    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignupStep step;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignupStatus status;

    @Column(columnDefinition = "jsonb")
    private String metadata;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected SignupSession() {
    }

    public SignupSession(AuthProvider provider, String state, SignupStep step, SignupStatus status, Instant expiresAt) {
        this.provider = provider;
        this.state = state;
        this.step = step;
        this.status = status;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public String getState() {
        return state;
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public SignupStep getStep() {
        return step;
    }

    public void setStep(SignupStep step) {
        this.step = step;
    }

    public SignupStatus getStatus() {
        return status;
    }

    public void setStatus(SignupStatus status) {
        this.status = status;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }
}
