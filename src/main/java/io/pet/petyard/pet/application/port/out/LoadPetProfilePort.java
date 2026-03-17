package io.pet.petyard.pet.application.port.out;

import io.pet.petyard.pet.domain.model.PetProfile;

import java.util.List;
import java.util.Optional;

public interface LoadPetProfilePort {
    List<PetProfile> findByUserId(Long userId);
    Optional<PetProfile> findByIdAndUserId(Long id, Long userId);
}
