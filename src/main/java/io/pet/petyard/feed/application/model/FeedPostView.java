package io.pet.petyard.feed.application.model;

import java.time.Instant;
import java.util.List;

public record FeedPostView(
    Long id,
    String content,
    String imageUrl,
    Double imageAspectRatioValue,
    String imageAspectRatio,
    Instant createdAt,
    List<String> hashtags
) {
}
