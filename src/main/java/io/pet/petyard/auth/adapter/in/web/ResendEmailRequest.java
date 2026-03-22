package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "이메일 인증 코드 재발송 요청")
public record ResendEmailRequest(
    @Schema(description = "재발송 대상 이메일", example = "owner@petyard.com")
    @Email @NotBlank String email
) {
}
