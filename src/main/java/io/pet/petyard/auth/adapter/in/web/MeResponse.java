package io.pet.petyard.auth.adapter.in.web;

import java.util.Set;

public record MeResponse(
    long userId,
    String tier,
    Set<String> permissions
) {
}
