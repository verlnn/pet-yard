package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.HomeFeedPostView;

import java.time.Instant;
import java.util.List;

public record HomeFeedPostResponse(
    Long id,
    String content,
    String thumbnailImageUrl,
    List<String> imageUrls,
    Double imageAspectRatioValue,
    String imageAspectRatio,
    long pawCount,
    boolean pawedByMe,
    Instant createdAt,
    List<String> hashtags,
    Long authorId,
    String authorNickname,
    String authorProfileImageUrl
) {
    public static HomeFeedPostResponse from(HomeFeedPostView post) {
        return new HomeFeedPostResponse(
            post.id(),
            post.content(),
            post.media().thumbnailImageUrl(),
            post.media().imageUrls(),
            post.media().imageAspectRatioValue(),
            post.media().imageAspectRatio(),
            post.reaction().pawCount(),
            post.reaction().pawedByMe(),
            post.createdAt(),
            post.hashtags(),
            post.author().id(),
            post.author().nickname(),
            post.author().profileImageUrl()
        );
    }
}
