package io.pet.petyard.pet.adapter.in.web;

import jakarta.validation.constraints.NotBlank;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "반려동물 등록번호 검증 요청")
public record PetRegistrationRequest(
    @Schema(description = "동물등록번호", example = "DOG-123456")
    @NotBlank String dogRegNo,
    @Schema(description = "RFID 코드", example = "RFID-1234")
    @NotBlank String rfidCd,
    @Schema(description = "보호자 이름", example = "홍길동")
    @NotBlank String ownerNm,
    @Schema(description = "보호자 생년월일(YYYYMMDD)", example = "19900101")
    @NotBlank String ownerBirth,
    @Schema(description = "소개 문구", nullable = true)
    String intro,
    @Schema(description = "프로필 사진 URL", nullable = true)
    String photoUrl,
    @Schema(description = "몸무게(kg)", nullable = true, example = "4.3")
    Double weightKg,
    @Schema(description = "예방접종 완료 여부", nullable = true, example = "true")
    Boolean vaccinationComplete,
    @Schema(description = "산책 안전 검증 여부", nullable = true, example = "true")
    Boolean walkSafetyChecked
) {
}
