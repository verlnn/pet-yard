package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "온보딩 완료 응답")
public record SignupCompleteResponse(
    @Schema(description = "가입 완료 후 발급되는 access token")
    String accessToken,
    @Schema(description = "가입 완료 후 발급되는 refresh token")
    String refreshToken
) {
}
