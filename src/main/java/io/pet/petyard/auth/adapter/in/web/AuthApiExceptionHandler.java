package io.pet.petyard.auth.adapter.in.web;

import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthApiExceptionHandler {

    private final ErrorLogService errorLogService;

    public AuthApiExceptionHandler(ErrorLogService errorLogService) {
        this.errorLogService = errorLogService;
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex, HttpServletRequest request) {
        ErrorCode code = ex.errorCode();
        errorLogService.record(request, HttpStatus.BAD_REQUEST.value(), code.code(), code.message(), ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.of(code, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        errorLogService.record(request, HttpStatus.BAD_REQUEST.value(),
            ErrorCode.VALIDATION_FAILED.code(), ErrorCode.VALIDATION_FAILED.message(), ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.of(ErrorCode.VALIDATION_FAILED, request.getRequestURI()));
    }
}
