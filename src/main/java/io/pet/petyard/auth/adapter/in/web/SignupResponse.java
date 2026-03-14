package io.pet.petyard.auth.adapter.in.web;

import java.time.Instant;

public record SignupResponse(
    String email,
    Instant expiresAt
) {
}
