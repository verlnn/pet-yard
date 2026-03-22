package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Guardian Registration", description = "회원 간 집사 등록/해제 API")
@SecurityRequirement(name = "bearerAuth")
public class GuardianRegistrationController {

    private final GuardianRegistrationService guardianRegistrationService;

    public GuardianRegistrationController(GuardianRegistrationService guardianRegistrationService) {
        this.guardianRegistrationService = guardianRegistrationService;
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/{targetUserId}/guardians")
    @Operation(summary = "집사 등록", description = "다른 회원을 집사 등록 상태로 저장합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "집사 등록 성공",
            content = @Content(schema = @Schema(implementation = GuardianRegistrationResponse.class))),
        @ApiResponse(responseCode = "400", description = "자기 자신 등록 시도 또는 대상 회원 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GuardianRegistrationResponse register(@AuthenticationPrincipal AuthPrincipal principal,
                                                 @Parameter(description = "집사 등록 대상 회원 식별자", example = "11")
                                                 @PathVariable Long targetUserId) {
        boolean guardianRegisteredByMe = guardianRegistrationService.register(principal.userId(), targetUserId);
        return new GuardianRegistrationResponse(targetUserId, guardianRegisteredByMe);
    }

    @RequirePermission(Permission.FEED_CREATE)
    @DeleteMapping("/{targetUserId}/guardians")
    @Operation(summary = "집사 해제", description = "다른 회원에 대한 집사 등록 상태를 제거합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "집사 해제 성공",
            content = @Content(schema = @Schema(implementation = GuardianRegistrationResponse.class))),
        @ApiResponse(responseCode = "400", description = "자기 자신 해제 시도 또는 대상 회원 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GuardianRegistrationResponse unregister(@AuthenticationPrincipal AuthPrincipal principal,
                                                   @Parameter(description = "집사 해제 대상 회원 식별자", example = "11")
                                                   @PathVariable Long targetUserId) {
        boolean guardianRegisteredByMe = guardianRegistrationService.unregister(principal.userId(), targetUserId);
        return new GuardianRegistrationResponse(targetUserId, guardianRegisteredByMe);
    }
}
