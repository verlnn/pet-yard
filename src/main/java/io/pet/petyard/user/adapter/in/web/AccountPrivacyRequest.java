package io.pet.petyard.user.adapter.in.web;

import jakarta.validation.constraints.NotNull;

public record AccountPrivacyRequest(
    @NotNull Boolean isPrivate
) {}
