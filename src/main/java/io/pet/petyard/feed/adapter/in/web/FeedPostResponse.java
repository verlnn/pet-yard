package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.FeedPostView;

import java.time.Instant;
import java.util.List;

public record FeedPostResponse(
    Long id,
    String content,
    String imageUrl,
    Instant createdAt,
    List<String> hashtags
) {
    public static FeedPostResponse from(FeedPostView post) {
        return new FeedPostResponse(
            post.id(),
            post.content(),
            post.imageUrl(),
            post.createdAt(),
            post.hashtags()
        );
    }
}
