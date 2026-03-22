package io.pet.petyard.user.adapter.in.web;

import jakarta.validation.constraints.Size;

public record UserProfileSettingsRequest(
    @Size(max = 150) String bio,
    String gender,
    Long primaryPetId
) {
}
