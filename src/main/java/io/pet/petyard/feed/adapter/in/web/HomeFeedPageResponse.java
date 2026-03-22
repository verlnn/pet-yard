package io.pet.petyard.feed.adapter.in.web;

import java.util.List;

public record HomeFeedPageResponse(
    List<HomeFeedPostResponse> items,
    HomeFeedCursorResponse nextCursor,
    boolean hasMore
) {
}
