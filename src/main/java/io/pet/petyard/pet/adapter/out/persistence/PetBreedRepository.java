package io.pet.petyard.pet.adapter.out.persistence;

import io.pet.petyard.pet.domain.model.PetBreed;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PetBreedRepository extends JpaRepository<PetBreed, Long> {
    List<PetBreed> findBySpeciesOrderByNameKoAsc(String species);
}
