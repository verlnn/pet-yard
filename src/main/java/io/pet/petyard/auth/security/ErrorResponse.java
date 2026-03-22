package io.pet.petyard.auth.security;

import io.pet.petyard.common.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "공통 API 에러 응답")
public record ErrorResponse(
    @Schema(description = "애플리케이션 에러 코드", example = "BAD_REQUEST")
    String code,
    @Schema(description = "에러 메시지", example = "잘못된 요청입니다")
    String message,
    @Schema(description = "에러가 발생한 요청 경로", example = "/api/feeds")
    String path,
    @Schema(description = "에러 응답 생성 시각", example = "2026-03-23T03:41:15Z")
    Instant timestamp
) {
    public static ErrorResponse of(ErrorCode errorCode, String path) {
        return new ErrorResponse(errorCode.code(), errorCode.message(), path, Instant.now());
    }

    public static ErrorResponse of(String code, String message, String path) {
        return new ErrorResponse(code, message, path, Instant.now());
    }
}
