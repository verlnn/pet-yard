package io.pet.petyard.feed.application.model;

public record FeedPostPawResult(
    Long postId,
    long pawCount,
    boolean pawedByMe
) {
}
