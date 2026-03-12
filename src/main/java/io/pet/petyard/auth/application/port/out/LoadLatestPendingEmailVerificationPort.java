package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.EmailVerification;

import java.util.Optional;

public interface LoadLatestPendingEmailVerificationPort {
    Optional<EmailVerification> loadLatestPendingByEmail(String email);
}
