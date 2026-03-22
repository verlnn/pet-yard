package io.pet.petyard.feed.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "홈 피드 다음 페이지 cursor")
public record HomeFeedCursorResponse(
    @Schema(description = "다음 페이지 기준 createdAt", example = "2026-03-23T03:20:00Z")
    Instant createdAt,
    @Schema(description = "동일 시각 tie-break용 게시물 id", example = "123")
    Long id
) {
}
