package io.pet.petyard.feed.application.model;

import java.time.Instant;

public record FeedPostCommentView(
    Long id,
    Long postId,
    Long parentCommentId,
    String content,
    Instant createdAt,
    Long authorId,
    String authorUsername,
    String authorNickname,
    String authorProfileImageUrl,
    String authorPrimaryPetImageUrl,
    String replyToUsername,
    long pawCount,
    boolean pawedByMe
) {
}
