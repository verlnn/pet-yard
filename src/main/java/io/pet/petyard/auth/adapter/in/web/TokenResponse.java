package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "인증 토큰 응답")
public record TokenResponse(
    @Schema(description = "access token", example = "eyJhbGciOi...")
    String accessToken,
    @Schema(description = "refresh token", example = "eyJhbGciOi...")
    String refreshToken
) {
}
