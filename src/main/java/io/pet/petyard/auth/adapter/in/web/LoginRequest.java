package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "이메일 로그인 요청")
public record LoginRequest(
    @Schema(description = "로그인 이메일", example = "owner@petyard.com")
    @Email @NotBlank String email,
    @Schema(description = "로그인 비밀번호", example = "pass1234")
    @NotBlank String password
) {
}
