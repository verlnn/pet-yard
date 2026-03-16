package io.pet.petyard.onboarding.adapter.out.persistence;

import io.pet.petyard.onboarding.application.port.out.LoadSignupSessionPort;
import io.pet.petyard.onboarding.application.port.out.SaveSignupSessionPort;
import io.pet.petyard.onboarding.domain.model.SignupSession;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class SignupSessionPersistenceAdapter implements LoadSignupSessionPort, SaveSignupSessionPort {

    private final SignupSessionRepository repository;

    public SignupSessionPersistenceAdapter(SignupSessionRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<SignupSession> findByState(String state) {
        return repository.findByState(state);
    }

    @Override
    public Optional<SignupSession> findByToken(String token) {
        return repository.findBySessionToken(token);
    }

    @Override
    public SignupSession save(SignupSession session) {
        return repository.save(session);
    }
}
