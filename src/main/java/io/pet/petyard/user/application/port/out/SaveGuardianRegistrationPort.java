package io.pet.petyard.user.application.port.out;

import io.pet.petyard.user.domain.model.GuardianRegistration;

public interface SaveGuardianRegistrationPort {
    GuardianRegistration save(GuardianRegistration guardianRegistration);
}
