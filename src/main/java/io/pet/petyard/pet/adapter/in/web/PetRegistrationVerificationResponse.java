package io.pet.petyard.pet.adapter.in.web;

import java.time.LocalDate;

public record PetRegistrationVerificationResponse(
    String dogRegNo,
    String rfidCd,
    String name,
    LocalDate birthDate,
    String gender,
    String breed,
    Boolean neutered,
    String orgName,
    String officeTel,
    String approvalStatus,
    String registeredAt,
    String approvedAt
) {
}
