package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.FeedPostPawResult;

public record FeedPostPawResponse(
    Long postId,
    long pawCount,
    boolean pawedByMe
) {
    public static FeedPostPawResponse from(FeedPostPawResult result) {
        return new FeedPostPawResponse(result.postId(), result.pawCount(), result.pawedByMe());
    }
}
