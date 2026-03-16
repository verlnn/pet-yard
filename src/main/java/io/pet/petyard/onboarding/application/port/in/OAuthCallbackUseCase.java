package io.pet.petyard.onboarding.application.port.in;

public interface OAuthCallbackUseCase {
    OAuthCallbackResult handle(OAuthCallbackCommand command);

    record OAuthCallbackCommand(String provider, String code, String state, String redirectUri) {
    }

    record OAuthCallbackResult(
        String status,
        String signupToken,
        String nextStep,
        String accessToken,
        String refreshToken
    ) {
    }
}
