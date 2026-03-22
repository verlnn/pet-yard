package io.pet.petyard.feed.adapter.in.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "피드 게시물 댓글 작성 요청")
public record FeedPostCommentRequest(
    @Schema(description = "댓글 본문", example = "우리 강아지도 이 장난감 좋아해요.")
    @NotBlank
    @Size(max = 300)
    String content
) {
}
