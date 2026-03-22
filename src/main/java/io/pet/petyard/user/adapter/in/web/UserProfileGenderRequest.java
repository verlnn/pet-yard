package io.pet.petyard.user.adapter.in.web;

import jakarta.validation.constraints.NotBlank;

public record UserProfileGenderRequest(
    @NotBlank String gender
) {
}
