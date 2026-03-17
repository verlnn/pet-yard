package io.pet.petyard.pet.adapter.in.web;

import io.pet.petyard.pet.adapter.out.persistence.PetBreedRepository;
import io.pet.petyard.pet.domain.model.PetBreed;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pets/breeds")
public class PetBreedController {

    private final PetBreedRepository petBreedRepository;

    public PetBreedController(PetBreedRepository petBreedRepository) {
        this.petBreedRepository = petBreedRepository;
    }

    @GetMapping
    public List<PetBreedResponse> list(@RequestParam String species) {
        List<PetBreed> breeds = petBreedRepository.findBySpeciesOrderByNameKoAsc(species.toUpperCase());
        return breeds.stream()
            .map(breed -> new PetBreedResponse(breed.getId(), breed.getNameKo(), breed.getNameEn()))
            .toList();
    }
}
