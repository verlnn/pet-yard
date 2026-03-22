package io.pet.petyard.feed.application.model;

import java.time.Instant;
import java.util.List;

public record HomeFeedPostView(
    Long id,
    String content,
    Instant createdAt,
    List<String> hashtags,
    HomeFeedAuthorView author,
    HomeFeedMediaView media,
    HomeFeedReactionView reaction
) {
}
