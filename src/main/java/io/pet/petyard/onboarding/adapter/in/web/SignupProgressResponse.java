package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "온보딩 진행 상태 응답")
public record SignupProgressResponse(
    @Schema(description = "현재 단계", example = "PROFILE")
    String step,
    @Schema(description = "signup token 만료 시각", example = "2026-03-23T04:10:00Z")
    String expiresAt,
    @Schema(description = "반려동물 보유 여부", example = "true")
    boolean hasPet,
    @Schema(description = "입력된 닉네임", nullable = true, example = "멍냥집사")
    String nickname,
    @Schema(description = "입력된 프로필 이미지 URL", nullable = true)
    String profileImageUrl
) {
}
