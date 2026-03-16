package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.AuthIdentity;

public interface SaveAuthIdentityPort {
    AuthIdentity save(AuthIdentity identity);
}
