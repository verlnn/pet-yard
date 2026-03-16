package io.pet.petyard.auth.adapter.out.persistence;

import io.pet.petyard.auth.application.port.out.LoadAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.SaveAuthIdentityPort;
import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.domain.model.AuthIdentity;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class AuthIdentityPersistenceAdapter implements LoadAuthIdentityPort, SaveAuthIdentityPort {

    private final AuthIdentityRepository repository;

    public AuthIdentityPersistenceAdapter(AuthIdentityRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<AuthIdentity> findByProviderAndProviderUserId(AuthProvider provider, String providerUserId) {
        return repository.findByProviderAndProviderUserId(provider, providerUserId);
    }

    @Override
    public Optional<AuthIdentity> findByEmail(String email) {
        return repository.findByEmail(email);
    }

    @Override
    public AuthIdentity save(AuthIdentity identity) {
        return repository.save(identity);
    }
}
