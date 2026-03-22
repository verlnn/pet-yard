package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "이메일 인증 코드 확인 요청")
public record VerifyEmailRequest(
    @Schema(description = "인증 대상 이메일", example = "owner@petyard.com")
    @Email @NotBlank String email,
    @Schema(description = "인증 코드", example = "123456")
    @NotBlank String code
) {
}
