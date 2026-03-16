package io.pet.petyard.onboarding.application.port.out;

import io.pet.petyard.onboarding.domain.model.SignupSession;

public interface SaveSignupSessionPort {
    SignupSession save(SignupSession session);
}
