package io.pet.petyard.pet.adapter.in.web;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "반려동물 프로필 응답")
public record PetProfileResponse(
    @Schema(description = "반려동물 식별자", example = "7")
    Long id,
    @Schema(description = "반려동물 이름", example = "보리")
    String name,
    @Schema(description = "반려동물 종", example = "DOG")
    String species,
    @Schema(description = "품종명", nullable = true, example = "푸들")
    String breed,
    @Schema(description = "생년월일", nullable = true)
    LocalDate birthDate,
    @Schema(description = "연령대", nullable = true, example = "ADULT")
    String ageGroup,
    @Schema(description = "성별", example = "MALE")
    String gender,
    @Schema(description = "중성화 여부", nullable = true, example = "true")
    Boolean neutered,
    @Schema(description = "소개 문구", nullable = true, example = "산책을 좋아하는 아이예요.")
    String intro,
    @Schema(description = "프로필 사진 URL", nullable = true, example = "https://cdn.petyard.test/pets/bori.jpg")
    String photoUrl,
    @Schema(description = "몸무게(kg)", nullable = true, example = "4.2")
    Double weightKg,
    @Schema(description = "예방접종 완료 여부", nullable = true, example = "true")
    Boolean vaccinationComplete,
    @Schema(description = "산책 안전 검증 여부", nullable = true, example = "true")
    Boolean walkSafetyChecked
) {
}
