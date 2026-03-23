package io.pet.petyard.onboarding.adapter.in.web;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "온보딩 프로필 입력 요청")
public record SignupProfileRequest(
    @Schema(description = "닉네임", example = "멍냥집사")
    @NotBlank String nickname,
    @Schema(description = "공개 사용자 ID. 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용 가능하며 저장 시 소문자로 정규화됩니다.", example = "meongnyang.owner")
    @NotBlank String username,
    @Schema(description = "지역 코드", nullable = true, example = "11010")
    String regionCode,
    @Schema(description = "프로필 이미지 URL", nullable = true, example = "https://cdn.petyard.test/profile.jpg")
    String profileImageUrl,
    @Schema(description = "마케팅 수신 동의 여부", example = "false")
    boolean marketingOptIn,
    @Schema(description = "반려동물 보유 여부", example = "true")
    boolean hasPet
) {
}
