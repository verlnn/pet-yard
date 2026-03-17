package io.pet.petyard.pet.adapter.in.web;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.application.port.out.SavePetProfilePort;
import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;
import io.pet.petyard.pet.domain.model.PetProfile;

import java.math.BigDecimal;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pets")
public class PetProfileController {

    private final LoadPetProfilePort loadPetProfilePort;
    private final SavePetProfilePort savePetProfilePort;
    private final AnimalRegistrationService registrationService;

    public PetProfileController(LoadPetProfilePort loadPetProfilePort,
                                SavePetProfilePort savePetProfilePort,
                                AnimalRegistrationService registrationService) {
        this.loadPetProfilePort = loadPetProfilePort;
        this.savePetProfilePort = savePetProfilePort;
        this.registrationService = registrationService;
    }

    @PostMapping("/verify")
    public PetRegistrationVerificationResponse verify(@Valid @RequestBody PetRegistrationRequest request) {
        AnimalRegistrationResult result = registrationService.verify(
            request.dogRegNo(),
            request.rfidCd(),
            request.ownerNm(),
            request.ownerBirth()
        );

        return new PetRegistrationVerificationResponse(
            result.dogRegNo(),
            result.rfidCd(),
            result.name(),
            result.birthDate(),
            result.gender().name(),
            result.breed(),
            result.neutered(),
            result.orgName(),
            result.officeTel(),
            result.approvalStatus(),
            result.registeredAt(),
            result.approvedAt()
        );
    }

    @PostMapping
    public PetProfileResponse create(@AuthenticationPrincipal AuthPrincipal principal,
                                     @Valid @RequestBody PetRegistrationRequest request) {
        AnimalRegistrationResult result = registrationService.verify(
            request.dogRegNo(),
            request.rfidCd(),
            request.ownerNm(),
            request.ownerBirth()
        );
        PetProfile profile = new PetProfile(
            principal.userId(),
            result.name(),
            PetSpecies.DOG,
            result.breed(),
            result.birthDate(),
            null,
            result.gender(),
            result.neutered(),
            request.intro(),
            request.photoUrl(),
            request.weightKg() == null ? null : BigDecimal.valueOf(request.weightKg()),
            request.vaccinationComplete(),
            request.walkSafetyChecked()
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
            saved.getWeightKg() == null ? null : saved.getWeightKg().doubleValue(),
            saved.getVaccinationComplete(),
            saved.getWalkSafetyChecked()
        );
    }

    @PatchMapping("/{id}")
    public PetProfileResponse update(@AuthenticationPrincipal AuthPrincipal principal,
                                     @PathVariable Long id,
                                     @Valid @RequestBody PetProfileRequest request) {
        PetProfile profile = loadPetProfilePort.findByIdAndUserId(id, principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));

        PetSpecies species = parseSpecies(request.species());
        PetGender gender = parseGender(request.gender());
        profile.updateFrom(
            request.name(),
            species,
            request.breed(),
            request.birthDate(),
            request.ageGroup(),
            gender,
            request.neutered(),
            request.intro(),
            request.photoUrl(),
            request.weightKg() == null ? null : BigDecimal.valueOf(request.weightKg()),
            request.vaccinationComplete(),
            request.walkSafetyChecked()
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
            saved.getWeightKg() == null ? null : saved.getWeightKg().doubleValue(),
            saved.getVaccinationComplete(),
            saved.getWalkSafetyChecked()
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
