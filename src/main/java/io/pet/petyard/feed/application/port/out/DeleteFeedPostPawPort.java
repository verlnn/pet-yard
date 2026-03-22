package io.pet.petyard.feed.application.port.out;

public interface DeleteFeedPostPawPort {
    void deleteByPostIdAndUserId(Long postId, Long userId);
}
