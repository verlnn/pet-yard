package io.pet.petyard.pet.application.port.out;

import io.pet.petyard.pet.domain.model.PetProfile;

public interface SavePetProfilePort {
    PetProfile save(PetProfile profile);
}
