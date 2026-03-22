package io.pet.petyard.onboarding.adapter.in.web;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "온보딩 약관 동의 요청")
public record SignupConsentsRequest(
    @Schema(description = "약관 동의 목록")
    @NotEmpty List<ConsentItemRequest> consents
) {
    @Schema(description = "약관 동의 항목")
    public record ConsentItemRequest(String code, boolean agreed) {
    }
}
