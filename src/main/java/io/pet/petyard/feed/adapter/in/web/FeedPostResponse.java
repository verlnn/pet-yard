package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.domain.model.FeedPost;

import java.time.Instant;

public record FeedPostResponse(
    Long id,
    String content,
    String imageUrl,
    Instant createdAt
) {
    public static FeedPostResponse from(FeedPost post) {
        return new FeedPostResponse(
            post.getId(),
            post.getContent(),
            post.getImageUrl(),
            post.getCreatedAt()
        );
    }
}
