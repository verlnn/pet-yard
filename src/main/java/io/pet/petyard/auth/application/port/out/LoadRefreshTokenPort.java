package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.RefreshToken;

import java.util.Optional;

public interface LoadRefreshTokenPort {
    Optional<RefreshToken> loadByTokenHash(String tokenHash);
}
