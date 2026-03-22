package io.pet.petyard.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.common.ApiMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boarding")
@Tag(name = "Boarding", description = "돌봄 서비스 신청 API")
@SecurityRequirement(name = "bearerAuth")
public class BoardingController {

    @RequirePermission(Permission.BOARDING_APPLY)
    @PostMapping("/apply")
    @Operation(summary = "돌봄 신청", description = "현재 사용자 권한으로 돌봄 신청을 접수합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "신청 성공",
            content = @Content(schema = @Schema(implementation = SimpleResultResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "권한 부족")
    })
    public Map<String, Object> applyBoarding() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.APPLIED.message());
        return body;
    }

    @Schema(description = "단순 결과 응답")
    record SimpleResultResponse(@Schema(description = "처리 결과 메시지", example = "applied") String result) {
    }
}
