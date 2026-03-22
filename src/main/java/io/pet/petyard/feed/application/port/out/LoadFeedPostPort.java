package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.domain.model.FeedPost;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface LoadFeedPostPort {
    List<FeedPost> findByUserId(Long userId);
    List<FeedPost> findHomeFeedPage(Instant cursorCreatedAt, Long cursorId, int limit);
    Optional<FeedPost> findById(Long id);
    Optional<FeedPost> findByIdAndUserId(Long id, Long userId);
}
