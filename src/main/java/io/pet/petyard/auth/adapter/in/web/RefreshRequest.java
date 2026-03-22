package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "리프레시 토큰 재발급 요청")
public record RefreshRequest(
    @Schema(description = "재발급에 사용할 refresh token", example = "eyJhbGciOi...")
    @NotBlank String refreshToken
) {
}
