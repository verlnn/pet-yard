package io.pet.petyard.pet.adapter.in.web;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
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
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;

    public PetProfileController(LoadPetProfilePort loadPetProfilePort,
                                SavePetProfilePort savePetProfilePort,
                                AnimalRegistrationService registrationService,
                                LoadUserPort loadUserPort,
                                SaveUserPort saveUserPort) {
        this.loadPetProfilePort = loadPetProfilePort;
        this.savePetProfilePort = savePetProfilePort;
        this.registrationService = registrationService;
        this.loadUserPort = loadUserPort;
        this.saveUserPort = saveUserPort;
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
        promoteTierIfNeeded(principal.userId());
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

        Boolean neutered = Boolean.TRUE.equals(profile.getNeutered()) ? Boolean.TRUE : request.neutered();
        profile.updateFrom(
            request.name(),
            profile.getSpecies(),
            profile.getBreed(),
            profile.getBirthDate(),
            request.ageGroup(),
            profile.getGender(),
            neutered,
            request.intro(),
            request.photoUrl(),
            request.weightKg() == null ? null : BigDecimal.valueOf(request.weightKg()),
            request.vaccinationComplete(),
            request.walkSafetyChecked()
        );

        PetProfile saved = savePetProfilePort.save(profile);
        promoteTierIfNeeded(principal.userId());
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

    private void promoteTierIfNeeded(Long userId) {
        User user = loadUserPort.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        if (user.getTier() == UserTier.TIER_0) {
            user.setTier(UserTier.TIER_1);
            saveUserPort.save(user);
        }
    }
}
