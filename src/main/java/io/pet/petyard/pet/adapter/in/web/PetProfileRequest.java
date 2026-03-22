package io.pet.petyard.pet.adapter.in.web;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "반려동물 프로필 수정 요청")
public record PetProfileRequest(
    @Schema(description = "반려동물 이름", example = "보리")
    @NotBlank String name,
    @Schema(description = "반려동물 종", example = "DOG")
    @NotBlank String species,
    @Schema(description = "품종명", nullable = true, example = "푸들")
    String breed,
    @Schema(description = "생년월일", nullable = true)
    LocalDate birthDate,
    @Schema(description = "연령대", nullable = true, example = "ADULT")
    String ageGroup,
    @Schema(description = "성별", example = "MALE")
    @NotBlank String gender,
    @Schema(description = "중성화 여부", nullable = true, example = "true")
    Boolean neutered,
    @Schema(description = "소개 문구", nullable = true)
    String intro,
    @Schema(description = "프로필 사진 URL", nullable = true)
    String photoUrl,
    @Schema(description = "몸무게(kg)", nullable = true, example = "4.3")
    Double weightKg,
    @Schema(description = "예방접종 완료 여부", nullable = true, example = "true")
    Boolean vaccinationComplete,
    @Schema(description = "산책 안전 검증 여부", nullable = true, example = "true")
    Boolean walkSafetyChecked
) {
}
