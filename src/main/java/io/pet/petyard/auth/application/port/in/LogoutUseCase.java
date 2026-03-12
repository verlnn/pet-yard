package io.pet.petyard.auth.application.port.in;

public interface LogoutUseCase {
    void logout(LogoutCommand command);

    record LogoutCommand(String refreshToken) {
    }
}
