package io.pet.petyard.auth.jwt;

import io.pet.petyard.auth.domain.UserTier;

public record AuthTokenPayload(
    long userId,
    UserTier tier
) {
}
