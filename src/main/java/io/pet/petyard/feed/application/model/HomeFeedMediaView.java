package io.pet.petyard.feed.application.model;

import java.util.List;

public record HomeFeedMediaView(
    String thumbnailImageUrl,
    List<String> imageUrls,
    List<HomeFeedImageView> images,
    Double imageAspectRatioValue,
    String imageAspectRatio
) {
}
