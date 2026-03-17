package io.pet.petyard.auth.jwt;

import io.pet.petyard.auth.domain.UserTier;

import java.time.Instant;

public record AccessClaims(
    long userId,
    UserTier tier,
    Instant expiresAt
) {
}
