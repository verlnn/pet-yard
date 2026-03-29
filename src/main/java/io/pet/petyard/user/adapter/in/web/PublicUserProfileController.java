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
import io.pet.petyard.user.application.port.in.GetPublicUserProfileUseCase;
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
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
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
    private final GetPublicUserProfileUseCase getPublicUserProfileUseCase;

    public PublicUserProfileController(LoadUserPort loadUserPort,
                                       LoadUserProfilePort loadUserProfilePort,
                                       LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                       LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                       LoadRegionPort loadRegionPort,
                                       LoadPetProfilePort loadPetProfilePort,
                                       GuardianRegistrationService guardianRegistrationService,
                                       GetPublicUserProfileUseCase getPublicUserProfileUseCase) {
        this.loadUserPort = loadUserPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.loadRegionPort = loadRegionPort;
        this.loadPetProfilePort = loadPetProfilePort;
        this.guardianRegistrationService = guardianRegistrationService;
        this.getPublicUserProfileUseCase = getPublicUserProfileUseCase;
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
        User user = resolvePublicUser(username);

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

        Long viewerId = principal == null ? null : principal.userId();
        GuardianRelationStatus relationStatus = viewerId == null
            ? GuardianRelationStatus.NONE
            : guardianRegistrationService.getRelationStatus(viewerId, user.getId());

        boolean canView = getPublicUserProfileUseCase.canViewContent(viewerId, user.getId());

        List<PetProfileResponse> pets = canView
            ? loadPetProfilePort.findByUserId(user.getId()).stream().map(this::toPetResponse).toList()
            : List.of();

        Long primaryPetId = canView
            ? (settings == null
                ? (pets.size() == 1 ? pets.getFirst().id() : null)
                : settings.getPrimaryPetId() != null
                ? settings.getPrimaryPetId()
                : (pets.size() == 1 ? pets.getFirst().id() : null))
            : null;

        return new PublicUserProfileResponse(
            user.getId(),
            user.getUsername(),
            profile.getNickname(),
            regionName,
            profile.getProfileImageUrl(),
            canView ? (settings == null ? null : settings.getBio()) : null,
            primaryPetId,
            relationStatus,
            loadGuardianRegistrationPort.countConnectedByUserId(user.getId()),
            canView ? pets.size() : 0,
            pets,
            profile.isPrivate()
        );
    }

    @GetMapping("/{username}/guardians")
    @Operation(summary = "집사 리스트 조회", description = "지정한 사용자 ID의 집사 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = PublicUserGuardiansResponse.class))),
        @ApiResponse(responseCode = "400", description = "사용자 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public PublicUserGuardiansResponse guardians(
        @AuthenticationPrincipal AuthPrincipal principal,
        @Parameter(description = "공개 사용자 ID", example = "meongnyang.owner")
        @PathVariable String username,
        @Parameter(description = "집사 검색어", example = "guardian")
        @RequestParam(required = false) String query
    ) {
        User user = resolvePublicUser(username);
        Long viewerId = principal == null ? null : principal.userId();
        if (!getPublicUserProfileUseCase.canViewContent(viewerId, user.getId())) {
            return new PublicUserGuardiansResponse(List.of());
        }
        List<Long> guardianIds = loadGuardianRegistrationPort.findConnectedGuardianUserIds(user.getId());
        List<UserProfile> guardianProfiles = guardianIds.isEmpty()
            ? List.of()
            : loadUserProfilePort.findByUserIds(guardianIds);
        Map<Long, UserProfile> profileMap = guardianProfiles.stream()
            .collect(Collectors.toMap(UserProfile::getUserId, profile -> profile));

        Set<User> guardianUsers = guardianIds.isEmpty()
            ? Set.of()
            : loadUserPort.findByIds(guardianIds);
        Map<Long, User> userMap = guardianUsers.stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));

        List<GuardianItem> guardians = guardianIds.stream()
            .map(guardianId -> toGuardianItem(guardianId, userMap.get(guardianId), profileMap.get(guardianId)))
            .filter(guardian -> matchesQuery(guardian, query))
            .toList();
        return new PublicUserGuardiansResponse(guardians);
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

    private User resolvePublicUser(String username) {
        String normalizedUsername;
        try {
            normalizedUsername = Username.fromRaw(username).value();
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
        return loadUserPort.findByUsername(normalizedUsername)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    private GuardianItem toGuardianItem(Long guardianId, User user, UserProfile profile) {
        String guardianUsername = user != null ? user.getUsername() : String.valueOf(guardianId);
        String guardianNickname = profile != null ? profile.getNickname() : guardianUsername;
        String guardianImage = profile != null ? profile.getProfileImageUrl() : null;
        return new GuardianItem(guardianId, guardianUsername, guardianNickname, guardianImage);
    }

    private boolean matchesQuery(GuardianItem guardian, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }

        String normalizedQuery = query.trim().toLowerCase();
        return guardian.username().toLowerCase().contains(normalizedQuery)
            || guardian.nickname().toLowerCase().contains(normalizedQuery);
    }
}
