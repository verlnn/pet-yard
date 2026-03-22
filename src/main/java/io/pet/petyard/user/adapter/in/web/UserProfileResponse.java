package io.pet.petyard.user.adapter.in.web;

import java.time.Instant;
import java.util.List;

import io.pet.petyard.pet.adapter.in.web.PetProfileResponse;

public record UserProfileResponse(
    Long userId,
    String nickname,
    String regionName,
    String profileImageUrl,
    String bio,
    String tier,
    Instant joinedAt,
    Instant lastLoginAt,
    int petCount,
    List<PetProfileResponse> pets
) {
}
