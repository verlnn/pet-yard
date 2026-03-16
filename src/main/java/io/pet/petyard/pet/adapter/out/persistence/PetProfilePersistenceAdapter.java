package io.pet.petyard.pet.adapter.out.persistence;

import io.pet.petyard.pet.application.port.out.SavePetProfilePort;
import io.pet.petyard.pet.domain.model.PetProfile;

import org.springframework.stereotype.Component;

@Component
public class PetProfilePersistenceAdapter implements SavePetProfilePort {

    private final PetProfileRepository repository;

    public PetProfilePersistenceAdapter(PetProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public PetProfile save(PetProfile profile) {
        return repository.save(profile);
    }
}
