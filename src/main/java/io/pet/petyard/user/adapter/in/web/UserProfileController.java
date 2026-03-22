package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.pet.adapter.in.web.PetProfileResponse;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.user.domain.UserProfileGender;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.port.out.SaveUserProfileSettingsPort;
import io.pet.petyard.user.domain.model.UserProfile;
import io.pet.petyard.user.domain.model.UserProfileSettings;

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
public class UserProfileController {

    private final LoadUserPort loadUserPort;
    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    private final SaveUserProfileSettingsPort saveUserProfileSettingsPort;
    private final LoadRegionPort loadRegionPort;
    private final LoadPetProfilePort loadPetProfilePort;

    public UserProfileController(LoadUserPort loadUserPort,
                                 LoadUserProfilePort loadUserProfilePort,
                                 LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                 SaveUserProfileSettingsPort saveUserProfileSettingsPort,
                                 LoadRegionPort loadRegionPort,
                                 LoadPetProfilePort loadPetProfilePort) {
        this.loadUserPort = loadUserPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.saveUserProfileSettingsPort = saveUserProfileSettingsPort;
        this.loadRegionPort = loadRegionPort;
        this.loadPetProfilePort = loadPetProfilePort;
    }

    @GetMapping("/profile")
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

        return new UserProfileResponse(
            user.getId(),
            profile.getNickname(),
            regionName,
            profile.getProfileImageUrl(),
            settings == null ? null : settings.getBio(),
            settings == null || settings.getGender() == null ? null : settings.getGender().name(),
            user.getTier().name(),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            petResponses.size(),
            petResponses
        );
    }

    @PatchMapping("/profile")
    public UserProfileResponse updateProfileSettings(@AuthenticationPrincipal AuthPrincipal principal,
                                                     @Valid @RequestBody UserProfileSettingsRequest request) {
        User user = loadUserPort.findById(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED));

        UserProfile profile = loadUserProfilePort.findByUserId(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));

        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(principal.userId())
            .orElseGet(() -> new UserProfileSettings(principal.userId(), null));
        settings.updateBio(normalizeBio(request.bio()));
        UserProfileSettings savedSettings = saveUserProfileSettingsPort.save(settings);

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

        return new UserProfileResponse(
            user.getId(),
            profile.getNickname(),
            regionName,
            profile.getProfileImageUrl(),
            savedSettings.getBio(),
            savedSettings.getGender() == null ? null : savedSettings.getGender().name(),
            user.getTier().name(),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            petResponses.size(),
            petResponses
        );
    }

    @PatchMapping("/profile/gender")
    public UserProfileResponse updateProfileGender(@AuthenticationPrincipal AuthPrincipal principal,
                                                   @Valid @RequestBody UserProfileGenderRequest request) {
        User user = loadUserPort.findById(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED));

        UserProfile profile = loadUserProfilePort.findByUserId(principal.userId())
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));

        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(principal.userId())
            .orElseGet(() -> new UserProfileSettings(principal.userId(), null));
        settings.updateGender(parseGender(request.gender()));
        UserProfileSettings savedSettings = saveUserProfileSettingsPort.save(settings);

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

        return new UserProfileResponse(
            user.getId(),
            profile.getNickname(),
            regionName,
            profile.getProfileImageUrl(),
            savedSettings.getBio(),
            savedSettings.getGender() == null ? null : savedSettings.getGender().name(),
            user.getTier().name(),
            user.getCreatedAt(),
            user.getLastLoginAt(),
            petResponses.size(),
            petResponses
        );
    }

    private String normalizeBio(String bio) {
        if (bio == null) {
            return null;
        }
        String trimmed = bio.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private UserProfileGender parseGender(String raw) {
        try {
            return UserProfileGender.valueOf(raw.trim().toUpperCase());
        } catch (Exception ex) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
    }
}
