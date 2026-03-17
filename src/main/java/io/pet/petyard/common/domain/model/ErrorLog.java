package io.pet.petyard.common.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "error_logs")
public class ErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int status;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(nullable = false, columnDefinition = "text")
    private String path;

    @Column(nullable = false, length = 10)
    private String method;

    private Long userId;

    @Column(columnDefinition = "text")
    private String userAgent;

    @Column(length = 45)
    private String clientIp;

    @Column(columnDefinition = "text")
    private String stackTrace;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected ErrorLog() {
    }

    public ErrorLog(int status, String code, String message, String path, String method, Long userId,
                    String userAgent, String clientIp, String stackTrace, Instant createdAt) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.path = path;
        this.method = method;
        this.userId = userId;
        this.userAgent = userAgent;
        this.clientIp = clientIp;
        this.stackTrace = stackTrace;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public int getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public String getMethod() {
        return method;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public String getClientIp() {
        return clientIp;
    }

    public String getStackTrace() {
        return stackTrace;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
