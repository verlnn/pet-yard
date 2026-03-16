package io.pet.petyard.onboarding.adapter.in.web;

public record SignupCompleteResponse(
    String accessToken,
    String refreshToken
) {
}
