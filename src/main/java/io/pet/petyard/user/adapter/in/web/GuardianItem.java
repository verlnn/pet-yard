package io.pet.petyard.user.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "집사 정보")
public record GuardianItem(
    @Schema(description = "집사 사용자 식별자", example = "21")
    Long userId,
    @Schema(description = "공개 사용자 ID", example = "guardian.master")
    String username,
    @Schema(description = "닉네임", example = "멍냥집사")
    String nickname,
    @Schema(description = "프로필 이미지 URL", nullable = true)
    String profileImageUrl
) {
}
