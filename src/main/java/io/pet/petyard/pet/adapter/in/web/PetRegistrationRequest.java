package io.pet.petyard.pet.adapter.in.web;

import jakarta.validation.constraints.NotBlank;

public record PetRegistrationRequest(
    @NotBlank String dogRegNo,
    @NotBlank String rfidCd,
    @NotBlank String ownerNm,
    @NotBlank String ownerBirth,
    String intro,
    String photoUrl,
    Double weightKg
) {
}
