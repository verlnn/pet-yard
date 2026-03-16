package io.pet.petyard.auth.adapter.out.persistence;

import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.domain.model.AuthIdentity;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthIdentityRepository extends JpaRepository<AuthIdentity, Long> {
    Optional<AuthIdentity> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
    Optional<AuthIdentity> findByEmail(String email);
    boolean existsByEmail(String email);
}
