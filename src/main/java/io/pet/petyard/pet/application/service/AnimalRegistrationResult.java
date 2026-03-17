package io.pet.petyard.pet.application.service;

import io.pet.petyard.pet.domain.PetGender;

import java.time.LocalDate;

public record AnimalRegistrationResult(
    String dogRegNo,
    String rfidCd,
    String name,
    LocalDate birthDate,
    PetGender gender,
    String breed,
    Boolean neutered,
    String orgName,
    String officeTel,
    String approvalStatus,
    String registeredAt,
    String approvedAt
) {
}
