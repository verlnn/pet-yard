package io.pet.petyard.auth.jwt;

import io.pet.petyard.auth.domain.UserTier;

public record AccessClaims(
    long userId,
    UserTier tier
) {
}
