package io.pet.petyard.onboarding.adapter.in.web;

public record SignupProgressResponse(
    String step,
    String expiresAt,
    boolean hasPet
) {
}
