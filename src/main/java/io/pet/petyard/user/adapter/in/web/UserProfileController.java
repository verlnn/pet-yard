package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.Username;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.pet.adapter.in.web.PetProfileResponse;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.pet.petyard.user.domain.UserProfileGender;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.port.out.SaveUserProfileSettingsPort;
import io.pet.petyard.user.domain.model.UserProfile;
import io.pet.petyard.user.domain.model.UserProfileSettings;
import io.pet.petyard.auth.security.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
@Tag(name = "User Profile", description = "내 프로필 조회 및 소개/성별/대표 반려동물 설정 API")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final LoadUserPort loadUserPort;
    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    private final LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    private final SaveUserProfileSettingsPort saveUserProfileSettingsPort;
    private final SaveUserPort saveUserPort;
    private final LoadRegionPort loadRegionPort;
    private final LoadPetProfilePort loadPetProfilePort;

    public UserProfileController(LoadUserPort loadUserPort,
                                 LoadUserProfilePort loadUserProfilePort,
                                 LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                 LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                 SaveUserProfileSettingsPort saveUserProfileSettingsPort,
                                 SaveUserPort saveUserPort,
                                 LoadRegionPort loadRegionPort,
                                 LoadPetProfilePort loadPetProfilePort) {
        this.loadUserPort = loadUserPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.saveUserProfileSettingsPort = saveUserProfileSettingsPort;
        this.saveUserPort = saveUserPort;
        this.loadRegionPort = loadRegionPort;
        this.loadPetProfilePort = loadPetProfilePort;
    }

    @GetMapping("/profile")
    @Operation(summary = "내 프로필 조회", description = "현재 로그인 사용자의 프로필과 프로필 설정, 반려동물 목록을 함께 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public UserProfileResponse profile(@AuthenticationPrincipal AuthPrincipal principal) {
        User user = loadUserPort.findById(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED));

        UserProfile profile = loadUserProfilePort.findByUserId(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(principal.userId())
            .orElse(null);

        String regionName = null;
        if (profile.getRegionCode() != null && !profile.getRegionCode().isBlank()) {
            regionName = loadRegionPort.findByCode(profile.getRegionCode())
                .map(region -> region.getName())
                .orElse(null);
        }

        List<PetProfile> pets = loadPetProfilePort.findByUserId(principal.userId());
        List<PetProfileResponse> petResponses = pets.stream()
            .map(pet -> new PetProfileResponse(
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
            ))
            .toList();

        return buildResponse(user, profile, settings, regionName, petResponses);
    }

    @PatchMapping("/profile")
    @Operation(summary = "내 프로필 설정 변경", description = "소개, 성별, 대표 반려동물을 한 번에 저장합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "저장 성공",
            content = @Content(schema = @Schema(implementation = UserProfileResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 입력 또는 반려동물 소유 불일치",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public UserProfileResponse updateProfileSettings(@AuthenticationPrincipal AuthPrincipal principal,
                                                     @Valid @RequestBody UserProfileSettingsRequest request) {
        User user = loadUserPort.findById(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED));

        UserProfile profile = loadUserProfilePort.findByUserId(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        String normalizedUsername = normalizeUsername(request.username());
        if (normalizedUsername != null
            && !normalizedUsername.equals(user.getUsername())
            && loadUserPort.existsByUsername(normalizedUsername)) {
            throw new ApiException(ErrorCode.USERNAME_ALREADY_TAKEN);
        }
        if (normalizedUsername != null) {
            user.setUsername(normalizedUsername);
            saveUserPort.save(user);
        }

        List<PetProfile> pets = loadPetProfilePort.findByUserId(principal.userId());
        Long requestedPrimaryPetId = request.primaryPetId();
        if (requestedPrimaryPetId != null) {
            loadPetProfilePort.findByIdAndUserId(requestedPrimaryPetId, principal.userId())
                .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        }

        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(principal.userId())
            .orElseGet(() -> new UserProfileSettings(principal.userId(), null));
        settings.updateBio(normalizeBio(request.bio()));
        settings.updateGender(request.gender() == null ? settings.getGender() : parseGender(request.gender()));
        settings.updatePrimaryPetId(resolvePrimaryPetId(requestedPrimaryPetId, pets));
        UserProfileSettings savedSettings = saveUserProfileSettingsPort.save(settings);

        String regionName = null;
        if (profile.getRegionCode() != null && !profile.getRegionCode().isBlank()) {
            regionName = loadRegionPort.findByCode(profile.getRegionCode())
                .map(region -> region.getName())
                .orElse(null);
        }

        List<PetProfileResponse> petResponses = pets.stream()
            .map(pet -> new PetProfileResponse(
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
            ))
            .toList();

        return buildResponse(user, profile, savedSettings, regionName, petResponses);
    }

    private String normalizeBio(String bio) {
        if (bio == null) {
            return null;
        }
        String trimmed = bio.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizeUsername(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            return Username.fromRaw(raw).value();
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.INVALID_USERNAME);
        }
    }

    private UserProfileGender parseGender(String raw) {
        try {
            return UserProfileGender.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
    }

    private Long resolvePrimaryPetId(Long requestedPrimaryPetId, List<PetProfile> pets) {
        if (requestedPrimaryPetId != null) {
            return requestedPrimaryPetId;
        }
        if (pets.size() == 1) {
            return pets.getFirst().getId();
        }
        return null;
    }

    private UserProfileResponse buildResponse(User user,
                                              UserProfile profile,
                                              UserProfileSettings settings,
                                              String regionName,
                                              List<PetProfileResponse> petResponses) {
        Long primaryPetId = settings == null
            ? (petResponses.size() == 1 ? petResponses.getFirst().id() : null)
            : settings.getPrimaryPetId() != null
            ? settings.getPrimaryPetId()
            : (petResponses.size() == 1 ? petResponses.getFirst().id() : null);
        return new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            profile.getNickname(),
            regionName,
            profile.getProfileImageUrl(),
            settings == null ? null : settings.getBio(),
            settings == null || settings.getGender() == null ? null : settings.getGender().name(),
            primaryPetId,
            user.getTier().name(),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            GuardianRelationStatus.NONE,
            loadGuardianRegistrationPort.countConnectedByUserId(user.getId()),
            petResponses.size(),
            petResponses
        );
    }
}
