package io.pet.petyard.auth.web;

public record TokenResponse(
    String accessToken,
    String refreshToken
) {
}
