package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.EmailVerification;

public interface SaveEmailVerificationPort {
    EmailVerification save(EmailVerification verification);
}
