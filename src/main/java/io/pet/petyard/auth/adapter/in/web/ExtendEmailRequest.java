package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "이메일 인증 만료 연장 요청")
public record ExtendEmailRequest(
    @Schema(description = "만료 연장 대상 이메일", example = "owner@petyard.com")
    @Email @NotBlank String email
) {
}
