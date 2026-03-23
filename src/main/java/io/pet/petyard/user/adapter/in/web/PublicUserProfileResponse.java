package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.pet.adapter.in.web.PetProfileResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "공개 프로필 응답")
public record PublicUserProfileResponse(
    @Schema(description = "사용자 식별자", example = "11")
    Long userId,
    @Schema(description = "공개 사용자 ID", example = "meongnyang.owner")
    String username,
    @Schema(description = "닉네임", example = "멍냥집사")
    String nickname,
    @Schema(description = "지역명", nullable = true, example = "부암동")
    String regionName,
    @Schema(description = "프로필 이미지 URL", nullable = true)
    String profileImageUrl,
    @Schema(description = "소개 문구", nullable = true)
    String bio,
    @Schema(description = "대표 반려동물 id", nullable = true)
    Long primaryPetId,
    @Schema(description = "집사 등록 수", example = "12")
    long guardianCount,
    @Schema(description = "등록된 반려동물 수", example = "2")
    int petCount,
    @Schema(description = "등록된 반려동물 목록")
    List<PetProfileResponse> pets
) {
}
