package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "OAuth 로그인 시작 응답")
public record OAuthStartResponse(
    @Schema(description = "인가 페이지 URL", example = "https://kauth.kakao.com/oauth/authorize?... ")
    String authorizeUrl,
    @Schema(description = "state 값", example = "oauth-state-123")
    String state,
    @Schema(description = "state 만료 시각", example = "2026-03-23T03:50:00Z")
    String expiresAt
) {
}
