package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "온보딩 공개 ID 확인 요청")
public record SignupUsernameCheckRequest(
    @Schema(description = "확인할 공개 ID", example = "meongnyang.owner")
    @NotBlank String username
) {
}
