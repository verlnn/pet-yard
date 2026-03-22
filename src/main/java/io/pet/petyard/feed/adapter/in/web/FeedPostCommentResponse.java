package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.FeedPostCommentView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "피드 게시물 댓글 응답")
public record FeedPostCommentResponse(
    @Schema(description = "댓글 식별자", example = "31")
    Long id,
    @Schema(description = "게시물 식별자", example = "10")
    Long postId,
    @Schema(description = "댓글 본문")
    String content,
    @Schema(description = "댓글 작성 시각")
    Instant createdAt,
    @Schema(description = "작성자 식별자", example = "5")
    Long authorId,
    @Schema(description = "작성자 닉네임", example = "멍냥집사")
    String authorNickname,
    @Schema(description = "작성자 프로필 이미지 URL", nullable = true)
    String authorProfileImageUrl
) {
    public static FeedPostCommentResponse from(FeedPostCommentView view) {
        return new FeedPostCommentResponse(
            view.id(),
            view.postId(),
            view.content(),
            view.createdAt(),
            view.authorId(),
            view.authorNickname(),
            view.authorProfileImageUrl()
        );
    }
}
