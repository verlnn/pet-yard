package io.pet.petyard.onboarding.adapter.in.web;

import jakarta.validation.constraints.NotBlank;

public record SignupProfileRequest(
    @NotBlank String nickname,
    String regionCode,
    String profileImageUrl,
    boolean marketingOptIn,
    boolean hasPet
) {
}
