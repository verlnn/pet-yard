package io.pet.petyard.feed.application.model;

import java.time.Instant;
import java.util.List;

public record HomeFeedSlice(
    List<HomeFeedPostView> items,
    Instant nextCursorCreatedAt,
    Long nextCursorId,
    boolean hasMore
) {
}
