package io.pet.petyard.onboarding.adapter.in.web;

public record OAuthCallbackResponse(
    String status,
    String signupToken,
    String nextStep,
    String accessToken,
    String refreshToken
) {
}
