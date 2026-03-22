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
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.port.out.SaveUserProfileSettingsPort;
import io.pet.petyard.user.domain.model.UserProfileSettings;
import io.pet.petyard.auth.security.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.util.List;

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
@Tag(name = "Pets", description = "반려동물 등록 검증, 생성, 수정 API")
public class PetProfileController {

    private final LoadPetProfilePort loadPetProfilePort;
    private final SavePetProfilePort savePetProfilePort;
    private final AnimalRegistrationService registrationService;
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    private final SaveUserProfileSettingsPort saveUserProfileSettingsPort;

    public PetProfileController(LoadPetProfilePort loadPetProfilePort,
                                SavePetProfilePort savePetProfilePort,
                                AnimalRegistrationService registrationService,
                                LoadUserPort loadUserPort,
                                SaveUserPort saveUserPort,
                                LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                SaveUserProfileSettingsPort saveUserProfileSettingsPort) {
        this.loadPetProfilePort = loadPetProfilePort;
        this.savePetProfilePort = savePetProfilePort;
        this.registrationService = registrationService;
        this.loadUserPort = loadUserPort;
        this.saveUserPort = saveUserPort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.saveUserProfileSettingsPort = saveUserProfileSettingsPort;
    }

    @PostMapping("/verify")
    @Operation(summary = "반려동물 등록 정보 검증", description = "국가동물보호정보시스템 조회를 통해 등록번호와 소유자 정보를 검증합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검증 성공",
            content = @Content(schema = @Schema(implementation = PetRegistrationVerificationResponse.class))),
        @ApiResponse(responseCode = "400", description = "등록 정보 검증 실패",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
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
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "반려동물 등록", description = "검증된 반려동물 정보를 내 계정에 등록합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "등록 성공",
            content = @Content(schema = @Schema(implementation = PetProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "검증 실패 또는 잘못된 입력",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
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
        assignPrimaryPetIfSingle(principal.userId(), saved.getId());
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
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "반려동물 수정", description = "내가 등록한 반려동물의 프로필 정보를 수정합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공",
            content = @Content(schema = @Schema(implementation = PetProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "수정 대상이 없거나 잘못된 입력",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
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

    private void assignPrimaryPetIfSingle(Long userId, Long createdPetId) {
        List<PetProfile> pets = loadPetProfilePort.findByUserId(userId);
        if (pets.size() != 1) {
            return;
        }

        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(userId)
            .orElseGet(() -> new UserProfileSettings(userId, null));
        if (settings.getPrimaryPetId() != null) {
            return;
        }
        settings.updatePrimaryPetId(createdPetId);
        saveUserProfileSettingsPort.save(settings);
    }
}
