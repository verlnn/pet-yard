package io.pet.petyard.feed.application.port.out;

public interface DeleteFeedPostCommentPawPort {
    void deleteByCommentIdAndUserId(Long commentId, Long userId);
}
