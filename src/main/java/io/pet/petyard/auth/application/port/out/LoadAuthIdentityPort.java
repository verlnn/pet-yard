package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.domain.model.AuthIdentity;

import java.util.Optional;

public interface LoadAuthIdentityPort {
    Optional<AuthIdentity> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId);
    Optional<AuthIdentity> findByEmail(String email);
}
