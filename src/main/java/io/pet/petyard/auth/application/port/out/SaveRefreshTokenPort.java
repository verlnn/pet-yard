package io.pet.petyard.auth.application.port.out;

import io.pet.petyard.auth.domain.model.RefreshToken;

public interface SaveRefreshTokenPort {
    RefreshToken save(RefreshToken token);
}
