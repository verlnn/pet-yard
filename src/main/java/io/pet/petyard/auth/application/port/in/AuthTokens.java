package io.pet.petyard.auth.application.port.in;

public record AuthTokens(String accessToken, String refreshToken) {
}
