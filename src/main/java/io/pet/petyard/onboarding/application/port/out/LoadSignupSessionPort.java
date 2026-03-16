package io.pet.petyard.onboarding.application.port.out;

import io.pet.petyard.onboarding.domain.model.SignupSession;

import java.util.Optional;

public interface LoadSignupSessionPort {
    Optional<SignupSession> findByState(String state);
    Optional<SignupSession> findByToken(String token);
}
