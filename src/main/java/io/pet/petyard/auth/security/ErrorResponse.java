package io.pet.petyard.auth.security;

import io.pet.petyard.common.ErrorCode;

import java.time.Instant;

public record ErrorResponse(
    String code,
    String message,
    String path,
    Instant timestamp
) {
    public static ErrorResponse of(ErrorCode errorCode, String path) {
        return new ErrorResponse(errorCode.code(), errorCode.message(), path, Instant.now());
    }

    public static ErrorResponse of(String code, String message, String path) {
        return new ErrorResponse(code, message, path, Instant.now());
    }
}
