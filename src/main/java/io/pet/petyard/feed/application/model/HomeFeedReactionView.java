package io.pet.petyard.feed.application.model;

public record HomeFeedReactionView(
    long pawCount,
    boolean pawedByMe
) {
}
