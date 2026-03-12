package io.pet.petyard.auth.adapter.in.web;

public record TokenResponse(
    String accessToken,
    String refreshToken
) {
}
