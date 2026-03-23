package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostCommentPort;
import io.pet.petyard.feed.domain.model.FeedPostComment;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class FeedPostCommentPersistenceAdapter implements LoadFeedPostCommentPort, SaveFeedPostCommentPort, DeleteFeedPostCommentPort {

    private final FeedPostCommentRepository repository;

    public FeedPostCommentPersistenceAdapter(FeedPostCommentRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<FeedPostComment> findByPostId(Long postId) {
        return repository.findByPostIdOrderByCreatedAtAscIdAsc(postId);
    }

    @Override
    public java.util.Optional<FeedPostComment> findById(Long commentId) {
        return repository.findById(commentId);
    }

    @Override
    public List<FeedPostComment> findByParentCommentId(Long parentCommentId) {
        return repository.findByParentCommentId(parentCommentId);
    }

    @Override
    public Map<Long, Long> countByPostIds(Collection<Long> postIds) {
        Map<Long, Long> counts = new LinkedHashMap<>();
        repository.countGroupedByPostIds(postIds).forEach(row -> counts.put((Long) row[0], (Long) row[1]));
        return counts;
    }

    @Override
    public FeedPostComment save(FeedPostComment comment) {
        return repository.save(comment);
    }

    @Override
    public void deleteByIds(Collection<Long> commentIds) {
        if (commentIds.isEmpty()) {
            return;
        }
        repository.deleteByIdIn(commentIds);
    }
}
