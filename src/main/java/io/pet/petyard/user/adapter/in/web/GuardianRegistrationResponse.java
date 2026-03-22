package io.pet.petyard.user.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "집사 등록 상태 응답")
public record GuardianRegistrationResponse(
    @Schema(description = "집사 등록 대상 회원 식별자", example = "11")
    Long targetUserId,
    @Schema(description = "현재 사용자의 집사 등록 여부", example = "true")
    boolean guardianRegisteredByMe
) {
}
