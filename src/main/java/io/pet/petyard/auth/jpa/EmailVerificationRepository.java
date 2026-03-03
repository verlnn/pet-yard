package io.pet.petyard.auth.jpa;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findTopByEmailAndVerifiedAtIsNullOrderByCreatedAtDesc(String email);
}
