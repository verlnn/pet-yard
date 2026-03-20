package io.pet.petyard.onboarding.adapter.in.web;

import jakarta.validation.constraints.NotBlank;

public record SignupPetRequest(
    @NotBlank String dogRegNo,
    @NotBlank String rfidCd,
    @NotBlank String ownerNm,
    @NotBlank String ownerBirth,
    String intro,
    String photoUrl
) {
}
