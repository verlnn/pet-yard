package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "온보딩 공개 ID 확인 응답")
public record SignupUsernameCheckResponse(
    @Schema(description = "사용 가능한 정규화된 공개 ID", example = "meongnyang.owner")
    String username,
    @Schema(description = "사용 가능 여부", example = "true")
    boolean available
) {
}
