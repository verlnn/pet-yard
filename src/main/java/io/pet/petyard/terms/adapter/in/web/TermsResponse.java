package io.pet.petyard.terms.adapter.in.web;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "약관 목록 조회 응답")
public record TermsResponse(
    @Schema(description = "조회된 약관 목록")
    List<TermsItem> terms
) {
    @Schema(description = "약관 항목")
    public record TermsItem(
        @Schema(description = "약관 코드", example = "SERVICE")
        String code,
        @Schema(description = "약관 버전", example = "1")
        int version,
        @Schema(description = "약관 제목", example = "서비스 이용약관")
        String title,
        @Schema(description = "필수 동의 여부", example = "true")
        boolean mandatory,
        @Schema(description = "약관 본문 URL", nullable = true, example = "https://petyard.io/terms/service")
        String contentUrl
    ) {
    }
}
