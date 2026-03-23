package io.pet.petyard.notification.adapter.in.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.notification.application.service.NotificationApplicationService;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "사용자 알림 조회 및 집사 요청 액션 API")
@SecurityRequirement(name = "bearerAuth")
public class UserNotificationController {

    private final NotificationApplicationService notificationApplicationService;
    private final GuardianRegistrationService guardianRegistrationService;

    public UserNotificationController(NotificationApplicationService notificationApplicationService,
                                      GuardianRegistrationService guardianRegistrationService) {
        this.notificationApplicationService = notificationApplicationService;
        this.guardianRegistrationService = guardianRegistrationService;
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping
    @Operation(summary = "알림 목록 조회", description = "현재 로그인 사용자의 최근 알림 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserNotificationResponse.class)))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<UserNotificationResponse> list(@AuthenticationPrincipal AuthPrincipal principal) {
        return notificationApplicationService.listNotifications(principal.userId());
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/unread-count")
    @Operation(summary = "읽지 않은 알림 수 조회", description = "현재 로그인 사용자의 읽지 않은 알림 수를 조회합니다.")
    public UserNotificationUnreadCountResponse unreadCount(@AuthenticationPrincipal AuthPrincipal principal) {
        return new UserNotificationUnreadCountResponse(
            notificationApplicationService.countUnreadNotifications(principal.userId())
        );
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/{notificationId}/guardians/accept")
    @Operation(summary = "집사 요청 수락", description = "알림 패널에서 집사 요청을 수락합니다.")
    public UserNotificationActionResponse acceptGuardianRequest(@AuthenticationPrincipal AuthPrincipal principal,
                                                                @PathVariable Long notificationId) {
        GuardianRelationStatus status = guardianRegistrationService.acceptFromNotification(principal.userId(), notificationId);
        return new UserNotificationActionResponse(notificationId, status);
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/{notificationId}/guardians/reject")
    @Operation(summary = "집사 요청 거절", description = "알림 패널에서 집사 요청을 거절합니다.")
    public UserNotificationActionResponse rejectGuardianRequest(@AuthenticationPrincipal AuthPrincipal principal,
                                                                @PathVariable Long notificationId) {
        GuardianRelationStatus status = guardianRegistrationService.rejectFromNotification(principal.userId(), notificationId);
        return new UserNotificationActionResponse(notificationId, status);
    }
}
