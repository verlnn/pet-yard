package io.pet.petyard.feed.application.port.out;

public interface SaveFeedPostPawPort {
    void save(Long postId, Long userId);
}
