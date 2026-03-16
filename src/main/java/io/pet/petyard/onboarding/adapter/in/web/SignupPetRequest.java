package io.pet.petyard.onboarding.adapter.in.web;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record SignupPetRequest(
    @NotBlank String name,
    @NotBlank String species,
    String breed,
    LocalDate birthDate,
    String ageGroup,
    @NotBlank String gender,
    Boolean neutered,
    String intro,
    String photoUrl
) {
}
