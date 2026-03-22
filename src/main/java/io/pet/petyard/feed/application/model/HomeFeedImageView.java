package io.pet.petyard.feed.application.model;

public record HomeFeedImageView(
    String thumbnailUrl,
    String mediumUrl,
    String originalUrl,
    Integer width,
    Integer height,
    Double aspectRatio,
    String aspectRatioCode
) {
}
