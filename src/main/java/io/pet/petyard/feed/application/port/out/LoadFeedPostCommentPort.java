package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.domain.model.FeedPostComment;

import java.util.Collection;
import java.util.List;

public interface LoadFeedPostCommentPort {
    List<FeedPostComment> findByPostId(Long postId);
    java.util.Optional<FeedPostComment> findById(Long commentId);
    List<FeedPostComment> findByParentCommentId(Long parentCommentId);
    java.util.Map<Long, Long> countByPostIds(Collection<Long> postIds);
}
