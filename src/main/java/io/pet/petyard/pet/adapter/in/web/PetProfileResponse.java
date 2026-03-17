package io.pet.petyard.pet.adapter.in.web;

import java.time.LocalDate;

public record PetProfileResponse(
    Long id,
    String name,
    String species,
    String breed,
    LocalDate birthDate,
    String ageGroup,
    String gender,
    Boolean neutered,
    String intro,
    String photoUrl,
    Double weightKg,
    Boolean vaccinationComplete,
    Boolean walkSafetyChecked
) {
}
