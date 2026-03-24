package io.pet.petyard.onboarding.adapter.out.persistence;

import io.pet.petyard.onboarding.domain.SignupStatus;
import io.pet.petyard.onboarding.domain.model.SignupSession;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SignupSessionRepository extends JpaRepository<SignupSession, Long> {
    Optional<SignupSession> findByState(String state);
    Optional<SignupSession> findBySessionToken(String sessionToken);
    List<SignupSession> findByExpiresAtBeforeAndStatus(Instant expiresAt, SignupStatus status);
}
