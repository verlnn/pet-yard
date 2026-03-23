package io.pet.petyard.notification.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "사용자 알림 응답")
public record UserNotificationResponse(
    @Schema(description = "알림 식별자", example = "101")
    Long id,
    @Schema(description = "알림 유형", example = "GUARDIAN_REQUEST")
    String type,
    @Schema(description = "알림 상태", example = "UNREAD")
    String status,
    @Schema(description = "행동 주체 회원 식별자", example = "11")
    Long actorUserId,
    @Schema(description = "행동 주체 공개 ID", example = "meong.owner")
    String actorUsername,
    @Schema(description = "행동 주체 닉네임", example = "멍이집사")
    String actorNickname,
    @Schema(description = "행동 주체 프로필 이미지 URL", nullable = true)
    String actorProfileImageUrl,
    @Schema(description = "알림 메시지", example = "멍이집사님이 집사 요청을 보냈어요")
    String message,
    @Schema(description = "알림 생성 시각")
    Instant createdAt,
    @Schema(description = "즉시 처리 가능한 알림인지 여부", example = "true")
    boolean actionable,
    @Schema(description = "주요 액션 버튼 라벨", nullable = true, example = "수락")
    String primaryActionLabel,
    @Schema(description = "보조 액션 버튼 라벨", nullable = true, example = "거절")
    String secondaryActionLabel
) {
}
