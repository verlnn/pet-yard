package io.pet.petyard.feed.application.model;

public record FeedPostImageCommand(
    String imageUrl,
    String content,
    Double imageAspectRatioValue,
    String imageAspectRatio,
    Integer sortOrder
) {
}
