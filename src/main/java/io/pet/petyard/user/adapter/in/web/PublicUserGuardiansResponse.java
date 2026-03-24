package io.pet.petyard.user.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "공개 집사 목록 응답")
public record PublicUserGuardiansResponse(
    @Schema(description = "집사 리스트")
    List<GuardianItem> guardians
) {
}
