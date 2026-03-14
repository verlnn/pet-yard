package io.pet.petyard.auth.application.port.in;

public interface SignUpUseCase {
    SignupResult signup(SignUpCommand command);

    record SignUpCommand(String email, String password) {
    }

    record SignupResult(long userId, String email, java.time.Instant expiresAt) {
    }
}
