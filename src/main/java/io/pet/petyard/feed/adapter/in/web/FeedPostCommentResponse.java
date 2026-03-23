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
    @Schema(description = "부모 댓글 식별자", nullable = true, example = "12")
    Long parentCommentId,
    @Schema(description = "댓글 본문")
    String content,
    @Schema(description = "댓글 작성 시각")
    Instant createdAt,
    @Schema(description = "작성자 식별자", example = "5")
    Long authorId,
    @Schema(description = "작성자 공개 ID", example = "meongnyang")
    String authorUsername,
    @Schema(description = "작성자 닉네임", example = "멍냥집사")
    String authorNickname,
    @Schema(description = "작성자 프로필 이미지 URL", nullable = true)
    String authorProfileImageUrl,
    @Schema(description = "작성자의 대표 반려동물 사진 URL", nullable = true)
    String authorPrimaryPetImageUrl,
    @Schema(description = "답글 대상 공개 ID", nullable = true, example = "meong.owner")
    String replyToUsername,
    @Schema(description = "댓글 발자국 수", example = "2")
    long pawCount,
    @Schema(description = "현재 사용자의 댓글 발자국 여부", example = "false")
    boolean pawedByMe
) {
    public static FeedPostCommentResponse from(FeedPostCommentView view) {
        return new FeedPostCommentResponse(
            view.id(),
            view.postId(),
            view.parentCommentId(),
            view.content(),
            view.createdAt(),
            view.authorId(),
            view.authorUsername(),
            view.authorNickname(),
            view.authorProfileImageUrl(),
            view.authorPrimaryPetImageUrl(),
            view.replyToUsername(),
            view.pawCount(),
            view.pawedByMe()
        );
    }
}
