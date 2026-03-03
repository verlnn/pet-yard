package io.pet.petyard.auth.web;

import java.util.Set;

public record MeResponse(
    long userId,
    String tier,
    Set<String> permissions
) {
}
