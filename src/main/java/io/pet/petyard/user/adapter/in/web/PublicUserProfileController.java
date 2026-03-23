package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.Username;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.pet.adapter.in.web.PetProfileResponse;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.pet.petyard.user.domain.model.UserProfile;
import io.pet.petyard.user.domain.model.UserProfileSettings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Public User Profile", description = "공개 사용자 ID(username) 기반 공개 프로필 조회 API")
public class PublicUserProfileController {

    private final LoadUserPort loadUserPort;
    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    private final LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    private final LoadRegionPort loadRegionPort;
    private final LoadPetProfilePort loadPetProfilePort;
    private final GuardianRegistrationService guardianRegistrationService;

    public PublicUserProfileController(LoadUserPort loadUserPort,
                                       LoadUserProfilePort loadUserProfilePort,
                                       LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                       LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                       LoadRegionPort loadRegionPort,
                                       LoadPetProfilePort loadPetProfilePort,
                                       GuardianRegistrationService guardianRegistrationService) {
        this.loadUserPort = loadUserPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.loadRegionPort = loadRegionPort;
        this.loadPetProfilePort = loadPetProfilePort;
        this.guardianRegistrationService = guardianRegistrationService;
    }

    @GetMapping("/{username}/profile")
    @Operation(summary = "공개 프로필 조회", description = "공개 사용자 ID(username)로 공개 프로필을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = PublicUserProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "존재하지 않는 사용자",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public PublicUserProfileResponse profile(
        @AuthenticationPrincipal AuthPrincipal principal,
        @Parameter(description = "공개 사용자 ID", example = "meongnyang.owner")
        @PathVariable String username
    ) {
        String normalizedUsername;
        try {
            normalizedUsername = Username.fromRaw(username).value();
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }

        User user = loadUserPort.findByUsername(normalizedUsername)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        UserProfile profile = loadUserProfilePort.findByUserId(user.getId())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(user.getId())
            .orElse(null);

        String regionName = null;
        if (profile.getRegionCode() != null && !profile.getRegionCode().isBlank()) {
            regionName = loadRegionPort.findByCode(profile.getRegionCode())
                .map(region -> region.getName())
                .orElse(null);
        }

        List<PetProfileResponse> pets = loadPetProfilePort.findByUserId(user.getId()).stream()
            .map(this::toPetResponse)
            .toList();

        Long primaryPetId = settings == null
            ? (pets.size() == 1 ? pets.getFirst().id() : null)
            : settings.getPrimaryPetId() != null
            ? settings.getPrimaryPetId()
            : (pets.size() == 1 ? pets.getFirst().id() : null);
        GuardianRelationStatus relationStatus = principal == null
            ? GuardianRelationStatus.NONE
            : guardianRegistrationService.getRelationStatus(principal.userId(), user.getId());

        return new PublicUserProfileResponse(
            user.getId(),
            user.getUsername(),
            profile.getNickname(),
            regionName,
            profile.getProfileImageUrl(),
            settings == null ? null : settings.getBio(),
            primaryPetId,
            relationStatus,
            loadGuardianRegistrationPort.countConnectedByUserId(user.getId()),
            pets.size(),
            pets
        );
    }

    private PetProfileResponse toPetResponse(PetProfile pet) {
        return new PetProfileResponse(
            pet.getId(),
            pet.getName(),
            pet.getSpecies().name(),
            pet.getBreed(),
            pet.getBirthDate(),
            pet.getAgeGroup(),
            pet.getGender().name(),
            pet.getNeutered(),
            pet.getIntro(),
            pet.getPhotoUrl(),
            pet.getWeightKg() == null ? null : pet.getWeightKg().doubleValue(),
            pet.getVaccinationComplete(),
            pet.getWalkSafetyChecked()
        );
    }
}
