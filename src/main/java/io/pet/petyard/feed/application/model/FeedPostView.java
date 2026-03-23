package io.pet.petyard.feed.application.model;

import java.time.Instant;
import java.util.List;

public record FeedPostView(
    Long id,
    String content,
    String thumbnailImageUrl,
    List<String> imageUrls,
    Double imageAspectRatioValue,
    String imageAspectRatio,
    long pawCount,
    boolean pawedByMe,
    long commentCount,
    Instant createdAt,
    List<String> hashtags
) {
}
