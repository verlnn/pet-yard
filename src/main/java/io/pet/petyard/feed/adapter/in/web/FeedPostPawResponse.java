package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.FeedPostPawResult;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "게시물 발자국 반응 변경 응답")
public record FeedPostPawResponse(
    @Schema(description = "게시물 식별자", example = "101")
    Long postId,
    @Schema(description = "변경 후 발자국 수", example = "9")
    long pawCount,
    @Schema(description = "현재 사용자의 발자국 여부", example = "true")
    boolean pawedByMe
) {
    public static FeedPostPawResponse from(FeedPostPawResult result) {
        return new FeedPostPawResponse(result.postId(), result.pawCount(), result.pawedByMe());
    }
}
