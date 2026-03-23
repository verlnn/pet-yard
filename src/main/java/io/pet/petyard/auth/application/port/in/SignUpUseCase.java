package io.pet.petyard.auth.application.port.in;

public interface SignUpUseCase {
    SignupResult signup(SignUpCommand command);

    record SignUpCommand(String email, String password, String username) {
    }

    record SignupResult(long userId, String email, String username, java.time.Instant expiresAt) {
    }
}
