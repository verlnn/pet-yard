package io.pet.petyard.auth.application.port.in;

import java.time.Instant;

public interface ResendEmailVerificationUseCase {

    ResendResult resendEmail(ResendCommand command);

    record ResendCommand(String email) {
    }

    record ResendResult(Instant expiresAt) {
    }
}
