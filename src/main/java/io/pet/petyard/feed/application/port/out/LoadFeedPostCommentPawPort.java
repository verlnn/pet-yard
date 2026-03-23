package io.pet.petyard.feed.application.port.out;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface LoadFeedPostCommentPawPort {
    Map<Long, Long> countByCommentIds(Collection<Long> commentIds);
    List<Long> findPawedCommentIds(Long userId, Collection<Long> commentIds);
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
}
