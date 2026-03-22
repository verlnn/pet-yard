package io.pet.petyard.pet.adapter.in.web;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "반려동물 등록번호 검증 응답")
public record PetRegistrationVerificationResponse(
    @Schema(description = "동물등록번호", example = "DOG-123456")
    String dogRegNo,
    @Schema(description = "RFID 코드", example = "RFID-1234")
    String rfidCd,
    @Schema(description = "반려동물 이름", example = "보리")
    String name,
    @Schema(description = "생년월일", nullable = true)
    LocalDate birthDate,
    @Schema(description = "성별", example = "MALE")
    String gender,
    @Schema(description = "품종명", nullable = true, example = "푸들")
    String breed,
    @Schema(description = "중성화 여부", nullable = true, example = "true")
    Boolean neutered,
    @Schema(description = "관할 기관명", nullable = true, example = "서울시 동물보호센터")
    String orgName,
    @Schema(description = "관할 기관 전화번호", nullable = true, example = "02-0000-0000")
    String officeTel,
    @Schema(description = "승인 상태", nullable = true, example = "승인")
    String approvalStatus,
    @Schema(description = "등록일시", nullable = true, example = "2024-01-01T10:00:00Z")
    String registeredAt,
    @Schema(description = "승인일시", nullable = true, example = "2024-01-02T10:00:00Z")
    String approvedAt
) {
}
