package io.pet.petyard.common.application.service;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.adapter.out.persistence.ErrorLogRepository;
import io.pet.petyard.common.domain.model.ErrorLog;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Clock;
import java.util.Objects;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class ErrorLogService {

    private static final Logger log = LoggerFactory.getLogger(ErrorLogService.class);

    private final ErrorLogRepository repository;
    private final Clock clock;

    public ErrorLogService(ErrorLogRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public void record(HttpServletRequest request, int status, String code, String message, Throwable ex) {
        Objects.requireNonNull(request, "request");

        Long userId = resolveUserId();
        String userAgent = request.getHeader("User-Agent");
        String clientIp = resolveClientIp(request);
        String stackTrace = ex != null ? stackTrace(ex) : null;
        String safeMessage = message != null ? message : "Unknown error";

        ErrorLog errorLog = new ErrorLog(
            status,
            code,
            safeMessage,
            request.getRequestURI(),
            request.getMethod(),
            userId,
            userAgent,
            clientIp,
            stackTrace,
            clock.instant()
        );

        log.error("API error {} {} [{}] (status={})",
            request.getMethod(),
            request.getRequestURI(),
            code,
            status,
            ex);

        try {
            repository.save(errorLog);
        } catch (Exception saveEx) {
            log.warn("Failed to persist error log", saveEx);
        }
    }

    private Long resolveUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthPrincipal authPrincipal) {
            return authPrincipal.userId();
        }
        return null;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] parts = forwardedFor.split(",");
            return parts[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String stackTrace(Throwable ex) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }
}
