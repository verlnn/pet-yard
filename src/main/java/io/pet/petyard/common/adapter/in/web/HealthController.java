package io.pet.petyard.common.adapter.in.web;

import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "서버 상태 점검 API")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "헬스 체크", description = "서버 프로세스가 응답 가능한 상태인지 확인합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "서버 정상 응답",
            content = @Content(schema = @Schema(implementation = HealthResponse.class)))
    })
    public Map<String, String> health() {
        log.info("=============== Health Check Success ===============");
        return Map.of("status", "okkkkkk");
    }

    @Schema(description = "헬스 체크 응답")
    record HealthResponse(@Schema(description = "서버 상태 문자열", example = "okkkkkk") String status) {
    }
}
