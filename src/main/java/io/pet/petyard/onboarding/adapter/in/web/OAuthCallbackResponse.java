package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OAuth 콜백 처리 응답")
public record OAuthCallbackResponse(
    @Schema(description = "처리 상태", example = "SIGNUP_REQUIRED")
    String status,
    @Schema(description = "온보딩 진행용 signup token", nullable = true, example = "signup-token")
    String signupToken,
    @Schema(description = "다음 온보딩 단계", nullable = true, example = "PROFILE")
    String nextStep,
    @Schema(description = "로그인 완료 시 발급되는 access token", nullable = true)
    String accessToken,
    @Schema(description = "로그인 완료 시 발급되는 refresh token", nullable = true)
    String refreshToken
) {
}
