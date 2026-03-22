package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.HomeFeedPostView;
import io.pet.petyard.feed.application.model.HomeFeedImageView;

import java.time.Instant;
import java.util.List;

public record HomeFeedPostResponse(
    Long id,
    String content,
    String thumbnailImageUrl,
    List<String> imageUrls,
    List<HomeFeedImageResponse> images,
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
            post.media().images().stream().map(HomeFeedImageResponse::from).toList(),
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

    public record HomeFeedImageResponse(
        String thumbnailUrl,
        String mediumUrl,
        String originalUrl,
        Integer width,
        Integer height,
        Double aspectRatio,
        String aspectRatioCode
    ) {
        public static HomeFeedImageResponse from(HomeFeedImageView image) {
            return new HomeFeedImageResponse(
                image.thumbnailUrl(),
                image.mediumUrl(),
                image.originalUrl(),
                image.width(),
                image.height(),
                image.aspectRatio(),
                image.aspectRatioCode()
            );
        }
    }
}
