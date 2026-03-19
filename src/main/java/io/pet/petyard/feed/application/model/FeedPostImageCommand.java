package io.pet.petyard.feed.application.model;

public record FeedPostImageCommand(
    String imageUrl,
    Double imageAspectRatioValue,
    String imageAspectRatio,
    Integer sortOrder
) {
}
