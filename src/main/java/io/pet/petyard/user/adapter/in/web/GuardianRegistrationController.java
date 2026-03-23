package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.GuardianRelationStatus;
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
@Tag(name = "Guardian Registration", description = "회원 간 집사 요청/수락/해제 API")
@SecurityRequirement(name = "bearerAuth")
public class GuardianRegistrationController {

    private final GuardianRegistrationService guardianRegistrationService;

    public GuardianRegistrationController(GuardianRegistrationService guardianRegistrationService) {
        this.guardianRegistrationService = guardianRegistrationService;
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/{targetUserId}/guardians")
    @Operation(summary = "집사 요청 또는 수락", description = "상대에게 집사 요청을 보내거나, 받은 요청을 수락합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "집사 요청/수락 성공",
            content = @Content(schema = @Schema(implementation = GuardianRegistrationResponse.class))),
        @ApiResponse(responseCode = "400", description = "자기 자신 요청 시도, 대상 회원 없음, 비인가적 요청 빈도",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GuardianRegistrationResponse requestOrAccept(@AuthenticationPrincipal AuthPrincipal principal,
                                                        @Parameter(description = "집사 요청 대상 회원 식별자", example = "11")
                                                        @PathVariable Long targetUserId) {
        GuardianRelationStatus relationStatus = guardianRegistrationService.requestOrAccept(principal.userId(), targetUserId);
        return new GuardianRegistrationResponse(
            targetUserId,
            relationStatus,
            relationStatus == GuardianRelationStatus.CONNECTED
        );
    }

    @RequirePermission(Permission.FEED_CREATE)
    @DeleteMapping("/{targetUserId}/guardians")
    @Operation(summary = "집사 관계 제거", description = "보낸 요청을 취소하거나 받은 요청을 거절하고, 연결된 집사 관계를 해제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "집사 관계 제거 성공",
            content = @Content(schema = @Schema(implementation = GuardianRegistrationResponse.class))),
        @ApiResponse(responseCode = "400", description = "자기 자신 해제 시도 또는 대상 회원 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public GuardianRegistrationResponse remove(@AuthenticationPrincipal AuthPrincipal principal,
                                               @Parameter(description = "집사 관계 제거 대상 회원 식별자", example = "11")
                                               @PathVariable Long targetUserId) {
        GuardianRelationStatus relationStatus = guardianRegistrationService.remove(principal.userId(), targetUserId);
        return new GuardianRegistrationResponse(targetUserId, relationStatus, false);
    }
}
