package io.pet.petyard.pet.adapter.in.web;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.pet.application.port.out.SavePetProfilePort;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;
import io.pet.petyard.pet.domain.model.PetProfile;

import java.math.BigDecimal;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pets")
public class PetProfileController {

    private final SavePetProfilePort savePetProfilePort;

    public PetProfileController(SavePetProfilePort savePetProfilePort) {
        this.savePetProfilePort = savePetProfilePort;
    }

    @PostMapping
    public PetProfileResponse create(@AuthenticationPrincipal AuthPrincipal principal,
                                     @Valid @RequestBody PetProfileRequest request) {
        PetSpecies species = parseSpecies(request.species());
        PetGender gender = parseGender(request.gender());

        PetProfile profile = new PetProfile(
            principal.userId(),
            request.name(),
            species,
            request.breed(),
            request.birthDate(),
            request.ageGroup(),
            gender,
            request.neutered(),
            request.intro(),
            request.photoUrl(),
            request.weightKg() == null ? null : BigDecimal.valueOf(request.weightKg())
        );

        PetProfile saved = savePetProfilePort.save(profile);
        return new PetProfileResponse(
            saved.getId(),
            saved.getName(),
            saved.getSpecies().name(),
            saved.getBreed(),
            saved.getBirthDate(),
            saved.getAgeGroup(),
            saved.getGender().name(),
            saved.getNeutered(),
            saved.getIntro(),
            saved.getPhotoUrl(),
            saved.getWeightKg() == null ? null : saved.getWeightKg().doubleValue()
        );
    }

    private PetSpecies parseSpecies(String raw) {
        try {
            return PetSpecies.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
    }

    private PetGender parseGender(String raw) {
        try {
            return PetGender.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
    }
}
