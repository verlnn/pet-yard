package io.pet.petyard.user.adapter.in.web;

import java.time.Instant;
import java.util.List;

import io.pet.petyard.pet.adapter.in.web.PetProfileResponse;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "내 프로필 상세 응답")
public record UserProfileResponse(
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
    @Schema(description = "성별 공개 값", nullable = true)
    String gender,
    @Schema(description = "대표 반려동물 id", nullable = true)
    Long primaryPetId,
    @Schema(description = "회원 티어", example = "TIER_1")
    String tier,
    @Schema(description = "가입 시각")
    Instant joinedAt,
    @Schema(description = "최근 로그인 시각", nullable = true)
    Instant lastLoginAt,
    @Schema(description = "현재 사용자의 집사 관계 상태", example = "NONE")
    GuardianRelationStatus guardianRelationStatus,
    @Schema(description = "연결된 집사 수", example = "12")
    long guardianCount,
    @Schema(description = "등록된 반려동물 수", example = "2")
    int petCount,
    @Schema(description = "등록된 반려동물 목록")
    List<PetProfileResponse> pets,
    @Schema(description = "비공개 계정 여부", example = "false")
    boolean isPrivate
) {
}
