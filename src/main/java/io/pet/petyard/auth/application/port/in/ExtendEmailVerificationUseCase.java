package io.pet.petyard.auth.application.port.in;

import java.time.Instant;

public interface ExtendEmailVerificationUseCase {

    ExtendResult extendEmail(ExtendCommand command);

    record ExtendCommand(String email) {
    }

    record ExtendResult(Instant expiresAt) {
    }
}
