package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.domain.model.FeedPost;

import java.util.List;
import java.util.Optional;

public interface LoadFeedPostPort {
    List<FeedPost> findByUserId(Long userId);
    Optional<FeedPost> findByIdAndUserId(Long id, Long userId);
}
