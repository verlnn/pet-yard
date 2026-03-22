package io.pet.petyard.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.common.ApiMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/walk")
@Tag(name = "Walk", description = "산책 게시물, 신청, 채팅 관련 API")
@SecurityRequirement(name = "bearerAuth")
public class WalkController {

    @RequirePermission(Permission.WALK_READ)
    @GetMapping("/posts")
    @Operation(summary = "산책 게시물 목록 조회", description = "산책 게시물 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = SimpleResultResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "권한 부족")
    })
    public Map<String, Object> listWalkPosts() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.OK.message());
        return body;
    }

    @RequirePermission(Permission.WALK_CREATE)
    @PostMapping("/posts")
    @Operation(summary = "산책 게시물 생성", description = "산책 게시물을 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "생성 성공",
            content = @Content(schema = @Schema(implementation = SimpleResultResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "권한 부족")
    })
    public Map<String, Object> createWalkPost() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.CREATED.message());
        return body;
    }

    @RequirePermission(Permission.WALK_APPLY)
    @PostMapping("/apply")
    @Operation(summary = "산책 신청", description = "산책 참여를 신청합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "신청 성공",
            content = @Content(schema = @Schema(implementation = SimpleResultResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "권한 부족")
    })
    public Map<String, Object> applyWalk() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.APPLIED.message());
        return body;
    }

    @RequirePermission(Permission.WALK_CHAT)
    @PostMapping("/chat/{roomId}")
    @Operation(summary = "산책 채팅 입장", description = "지정한 채팅방으로 메시지를 보냅니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "전송 성공",
            content = @Content(schema = @Schema(implementation = WalkChatResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요"),
        @ApiResponse(responseCode = "403", description = "권한 부족")
    })
    public Map<String, Object> chat(@Parameter(description = "채팅방 식별자", example = "room-123") @PathVariable String roomId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("roomId", roomId);
        body.put("result", ApiMessage.OK.message());
        return body;
    }

    @Schema(description = "산책 공통 결과 응답")
    record SimpleResultResponse(@Schema(description = "처리 결과 메시지", example = "ok") String result) {
    }

    @Schema(description = "산책 채팅 응답")
    record WalkChatResponse(
        @Schema(description = "채팅방 식별자", example = "room-123") String roomId,
        @Schema(description = "처리 결과 메시지", example = "ok") String result
    ) {
    }
}
