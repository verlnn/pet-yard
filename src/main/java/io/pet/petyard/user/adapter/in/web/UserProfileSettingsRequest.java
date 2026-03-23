package io.pet.petyard.user.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "내 프로필 설정 변경 요청")
public record UserProfileSettingsRequest(
    @Schema(description = "공개 사용자 ID. 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용 가능하며 저장 시 소문자로 정규화됩니다.", nullable = true, example = "meongnyang.owner")
    String username,
    @Schema(description = "소개 문구. 최대 150자", nullable = true, example = "산책과 기록을 좋아하는 보호자")
    @Size(max = 150) String bio,
    @Schema(description = "성별 공개 값", nullable = true, example = "UNSPECIFIED")
    String gender,
    @Schema(description = "대표 반려동물 id", nullable = true, example = "7")
    Long primaryPetId
) {
}
