package io.pet.petyard.feed.application.port.out;

public interface SaveFeedPostCommentPawPort {
    void save(Long commentId, Long userId);
}
