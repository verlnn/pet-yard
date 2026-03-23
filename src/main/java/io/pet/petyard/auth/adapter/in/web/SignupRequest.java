package io.pet.petyard.auth.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "이메일 회원가입 요청")
public record SignupRequest(
    @Schema(description = "공개 사용자 ID. 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용 가능하며 저장 시 소문자로 정규화됩니다.", example = "petyard.owner")
    @NotBlank String username,
    @Schema(description = "회원가입 이메일", example = "owner@petyard.com")
    @Email @NotBlank String email,
    @Schema(description = "회원가입 비밀번호", example = "pass1234")
    @NotBlank String password
) {
}
