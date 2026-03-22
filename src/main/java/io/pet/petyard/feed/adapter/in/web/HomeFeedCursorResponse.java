package io.pet.petyard.feed.adapter.in.web;

import java.time.Instant;

public record HomeFeedCursorResponse(
    Instant createdAt,
    Long id
) {
}
