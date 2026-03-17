package io.pet.petyard.auth.security;

import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.application.service.ErrorLogService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class SecurityExceptionHandler {

    private final ErrorLogService errorLogService;

    public SecurityExceptionHandler(ErrorLogService errorLogService) {
        this.errorLogService = errorLogService;
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        errorLogService.record(request, HttpStatus.UNAUTHORIZED.value(),
            ErrorCode.UNAUTHORIZED.code(), ErrorCode.UNAUTHORIZED.message(), ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse.of(ErrorCode.UNAUTHORIZED, request.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        errorLogService.record(request, HttpStatus.FORBIDDEN.value(),
            ErrorCode.FORBIDDEN.code(), ErrorCode.FORBIDDEN.message(), ex);
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse.of(ErrorCode.FORBIDDEN, request.getRequestURI()));
    }
}
