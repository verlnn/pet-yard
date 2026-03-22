package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Set;

@Schema(description = "현재 로그인 사용자 요약 응답")
public record MeResponse(
    @Schema(description = "사용자 식별자", example = "11")
    long userId,
    @Schema(description = "사용자 티어", example = "TIER_1")
    String tier,
    @Schema(description = "부여된 권한 목록")
    Set<String> permissions
) {
}
