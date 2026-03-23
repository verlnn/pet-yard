package io.pet.petyard.notification.adapter.in.web;

import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "알림 액션 처리 결과")
public record UserNotificationActionResponse(
    @Schema(description = "알림 식별자", example = "101")
    Long notificationId,
    @Schema(description = "처리 이후 집사 관계 상태", example = "CONNECTED")
    GuardianRelationStatus guardianRelationStatus
) {
}
