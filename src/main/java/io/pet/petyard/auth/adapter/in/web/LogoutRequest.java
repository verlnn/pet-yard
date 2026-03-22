package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "로그아웃 요청")
public record LogoutRequest(
    @Schema(description = "폐기할 refresh token", example = "eyJhbGciOi...")
    @NotBlank String refreshToken
) {
}
