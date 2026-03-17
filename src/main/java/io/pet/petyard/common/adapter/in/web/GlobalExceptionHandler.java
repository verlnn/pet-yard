package io.pet.petyard.common.adapter.in.web;

import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.application.service.ErrorLogService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class GlobalExceptionHandler {

    private final ErrorLogService errorLogService;

    public GlobalExceptionHandler(ErrorLogService errorLogService) {
        this.errorLogService = errorLogService;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnhandled(Exception ex, HttpServletRequest request) {
        errorLogService.record(request, HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ErrorCode.INTERNAL_ERROR.code(), ErrorCode.INTERNAL_ERROR.message(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse.of(ErrorCode.INTERNAL_ERROR, request.getRequestURI()));
    }
}
