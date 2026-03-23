package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "회원가입 후 이메일 인증 대기 응답")
public record SignupResponse(
    @Schema(description = "회원가입 이메일", example = "owner@petyard.com")
    String email,
    @Schema(description = "정규화된 공개 사용자 ID", example = "petyard.owner")
    String username,
    @Schema(description = "인증 코드 만료 시각", example = "2026-03-23T03:44:00Z")
    Instant expiresAt
) {
}
