package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "이메일 회원가입 요청")
public record SignupRequest(
    @Schema(description = "회원가입 이메일", example = "owner@petyard.com")
    @Email @NotBlank String email,
    @Schema(description = "회원가입 비밀번호", example = "pass1234")
    @NotBlank String password
) {
}
