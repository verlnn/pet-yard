package io.pet.petyard.feed.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "홈 피드 페이지 응답")
public record HomeFeedPageResponse(
    @Schema(description = "게시물 목록")
    List<HomeFeedPostResponse> items,
    @Schema(description = "다음 페이지 cursor. 마지막 페이지면 null")
    HomeFeedCursorResponse nextCursor,
    @Schema(description = "추가 페이지 존재 여부", example = "true")
    boolean hasMore
) {
}
