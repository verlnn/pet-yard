package io.pet.petyard.onboarding.adapter.in.web;

public record OAuthStartResponse(
    String authorizeUrl,
    String state,
    String expiresAt
) {
}
