package io.pet.petyard.feed.application.port.out;

import java.util.List;
import java.util.Map;

public interface LoadFeedPostPawPort {
    Map<Long, Long> countByPostIds(List<Long> postIds);
    List<Long> findPawedPostIds(Long userId, List<Long> postIds);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}
