package io.pet.petyard.auth.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "login_logs")
public class LoginLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 320)
    private String email;

    private Long userId;

    @Column(nullable = false)
    private boolean success;

    @Column(length = 50)
    private String failureCode;

    @Column(columnDefinition = "text")
    private String failureMessage;

    @Column(length = 45)
    private String clientIp;

    @Column(columnDefinition = "text")
    private String userAgent;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected LoginLog() {
    }

    public LoginLog(String email, Long userId, boolean success, String failureCode, String failureMessage,
                    String clientIp, String userAgent, Instant createdAt) {
        this.email = email;
        this.userId = userId;
        this.success = success;
        this.failureCode = failureCode;
        this.failureMessage = failureMessage;
        this.clientIp = clientIp;
        this.userAgent = userAgent;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public Long getUserId() {
        return userId;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getFailureCode() {
        return failureCode;
    }

    public String getFailureMessage() {
        return failureMessage;
    }

    public String getClientIp() {
        return clientIp;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
