package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "인증 코드 만료 시각 응답")
public record VerificationExpiryResponse(
    @Schema(description = "새 만료 시각", example = "2026-03-23T03:45:00Z")
    Instant expiresAt
) {
}
