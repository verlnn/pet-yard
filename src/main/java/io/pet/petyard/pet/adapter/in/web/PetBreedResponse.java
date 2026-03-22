package io.pet.petyard.pet.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "반려동물 품종 응답")
public record PetBreedResponse(
    @Schema(description = "품종 식별자", example = "12")
    Long id,
    @Schema(description = "국문 품종명", example = "푸들")
    String nameKo,
    @Schema(description = "영문 품종명", nullable = true, example = "Poodle")
    String nameEn
) {
}
