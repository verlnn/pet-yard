package io.pet.petyard.auth.adapter.out.persistence;

import io.pet.petyard.auth.domain.model.EmailVerification;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findTopByEmailAndVerifiedAtIsNullOrderByCreatedAtDesc(String email);
}
