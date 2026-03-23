package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.port.out.DeleteFeedPostCommentPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPawPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostCommentPawPort;
import io.pet.petyard.feed.domain.model.FeedPostCommentPaw;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class FeedPostCommentPawPersistenceAdapter implements LoadFeedPostCommentPawPort, SaveFeedPostCommentPawPort, DeleteFeedPostCommentPawPort {

    private final FeedPostCommentPawRepository repository;

    public FeedPostCommentPawPersistenceAdapter(FeedPostCommentPawRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Long> countByCommentIds(Collection<Long> commentIds) {
        Map<Long, Long> result = new HashMap<>();
        if (commentIds == null || commentIds.isEmpty()) {
            return result;
        }
        for (Object[] row : repository.countGroupedByCommentIds(commentIds)) {
            result.put((Long) row[0], (Long) row[1]);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> findPawedCommentIds(Long userId, Collection<Long> commentIds) {
        if (userId == null || commentIds == null || commentIds.isEmpty()) {
            return List.of();
        }
        return repository.findCommentIdsByUserIdAndCommentIdIn(userId, commentIds);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCommentIdAndUserId(Long commentId, Long userId) {
        return repository.existsByCommentIdAndUserId(commentId, userId);
    }

    @Override
    @Transactional
    public void save(Long commentId, Long userId) {
        repository.save(new FeedPostCommentPaw(commentId, userId));
    }

    @Override
    @Transactional
    public void deleteByCommentIdAndUserId(Long commentId, Long userId) {
        repository.deleteByCommentIdAndUserId(commentId, userId);
    }
}
