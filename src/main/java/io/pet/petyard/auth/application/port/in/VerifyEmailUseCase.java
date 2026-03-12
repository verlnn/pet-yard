package io.pet.petyard.auth.application.port.in;

public interface VerifyEmailUseCase {
    void verifyEmail(VerifyEmailCommand command);

    record VerifyEmailCommand(String email, String code) {
    }
}
