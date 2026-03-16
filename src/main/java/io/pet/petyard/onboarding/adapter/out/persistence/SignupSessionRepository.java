package io.pet.petyard.onboarding.adapter.out.persistence;

import io.pet.petyard.onboarding.domain.model.SignupSession;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SignupSessionRepository extends JpaRepository<SignupSession, Long> {
    Optional<SignupSession> findByState(String state);
    Optional<SignupSession> findBySessionToken(String sessionToken);
}
