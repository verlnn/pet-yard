package io.pet.petyard.auth.application.service;

import io.pet.petyard.auth.adapter.out.persistence.LoginLogRepository;
import io.pet.petyard.auth.domain.model.LoginLog;

import java.time.Clock;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LoginLogService {

    private static final Logger log = LoggerFactory.getLogger(LoginLogService.class);

    private final LoginLogRepository repository;
    private final Clock clock;

    public LoginLogService(LoginLogRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public void recordSuccess(HttpServletRequest request, String email, Long userId) {
        record(request, email, userId, true, null, null);
    }

    public void recordFailure(HttpServletRequest request, String email, String failureCode, String failureMessage) {
        record(request, email, null, false, failureCode, failureMessage);
    }

    private void record(HttpServletRequest request, String email, Long userId, boolean success,
                        String failureCode, String failureMessage) {
        String clientIp = resolveClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        LoginLog logEntry = new LoginLog(
            email,
            userId,
            success,
            failureCode,
            failureMessage,
            clientIp,
            userAgent,
            clock.instant()
        );

        log.info("Login attempt: success={} email={} userId={} ip={}",
            success,
            email,
            userId,
            clientIp);

        try {
            repository.save(logEntry);
        } catch (Exception ex) {
            log.warn("Failed to persist login log", ex);
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] parts = forwardedFor.split(",");
            return parts[0].trim();
        }
        return request.getRemoteAddr();
    }
}
