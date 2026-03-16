package io.pet.petyard.onboarding.application.port.in;

public interface OAuthStartUseCase {
    OAuthStartResult start(OAuthStartCommand command);

    record OAuthStartCommand(String provider) {
    }

    record OAuthStartResult(String authorizeUrl, String state, String expiresAt) {
    }
}
