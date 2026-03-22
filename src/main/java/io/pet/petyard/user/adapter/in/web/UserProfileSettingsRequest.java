package io.pet.petyard.user.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "내 프로필 설정 변경 요청")
public record UserProfileSettingsRequest(
    @Schema(description = "소개 문구. 최대 150자", nullable = true, example = "산책과 기록을 좋아하는 보호자")
    @Size(max = 150) String bio,
    @Schema(description = "성별 공개 값", nullable = true, example = "UNSPECIFIED")
    String gender,
    @Schema(description = "대표 반려동물 id", nullable = true, example = "7")
    Long primaryPetId
) {
}
