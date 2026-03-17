package io.pet.petyard.pet.adapter.in.web;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;

public record PetProfileRequest(
    @NotBlank String name,
    @NotBlank String species,
    String breed,
    LocalDate birthDate,
    String ageGroup,
    @NotBlank String gender,
    Boolean neutered,
    String intro,
    String photoUrl,
    Double weightKg,
    Boolean vaccinationComplete,
    Boolean walkSafetyChecked
) {
}
