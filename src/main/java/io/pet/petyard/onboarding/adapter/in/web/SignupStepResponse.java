package io.pet.petyard.onboarding.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "온보딩 다음 단계 응답")
public record SignupStepResponse(
    @Schema(description = "다음 단계", example = "CONSENTS")
    String nextStep
) {
}
