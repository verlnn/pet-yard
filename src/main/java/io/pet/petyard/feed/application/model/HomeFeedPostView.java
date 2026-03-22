package io.pet.petyard.feed.application.model;

import java.time.Instant;
import java.util.List;

public record HomeFeedPostView(
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
}
