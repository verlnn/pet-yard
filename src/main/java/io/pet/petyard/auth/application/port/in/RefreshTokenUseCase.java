package io.pet.petyard.auth.application.port.in;

public interface RefreshTokenUseCase {
    AuthTokens refresh(RefreshTokenCommand command);

    record RefreshTokenCommand(String refreshToken) {
    }
}
