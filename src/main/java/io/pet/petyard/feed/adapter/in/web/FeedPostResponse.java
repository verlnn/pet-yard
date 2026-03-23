package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.FeedPostView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(description = "내 게시물 목록 응답")
public record FeedPostResponse(
    @Schema(description = "게시물 식별자", example = "101")
    Long id,
    @Schema(description = "게시물 본문", nullable = true)
    String content,
    @Schema(description = "대표 이미지 URL", nullable = true)
    String thumbnailImageUrl,
    @Schema(description = "게시물 이미지 URL 목록")
    List<String> imageUrls,
    @Schema(description = "대표 이미지 종횡비 값", nullable = true)
    Double imageAspectRatioValue,
    @Schema(description = "대표 이미지 종횡비 코드", nullable = true, example = "1:1")
    String imageAspectRatio,
    @Schema(description = "발자국 수", example = "12")
    long pawCount,
    @Schema(description = "현재 사용자 발자국 여부", example = "false")
    boolean pawedByMe,
    @Schema(description = "댓글 수", example = "3")
    long commentCount,
    @Schema(description = "생성 시각")
    Instant createdAt,
    @Schema(description = "해시태그 목록")
    List<String> hashtags
) {
    public static FeedPostResponse from(FeedPostView post) {
        return new FeedPostResponse(
            post.id(),
            post.content(),
            post.thumbnailImageUrl(),
            post.imageUrls(),
            post.imageAspectRatioValue(),
            post.imageAspectRatio(),
            post.pawCount(),
            post.pawedByMe(),
            post.commentCount(),
            post.createdAt(),
            post.hashtags()
        );
    }
}
