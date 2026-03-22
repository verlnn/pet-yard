package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.port.out.DeleteFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPawPort;
import io.pet.petyard.feed.domain.model.FeedPostPaw;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class FeedPostPawPersistenceAdapter implements LoadFeedPostPawPort, SaveFeedPostPawPort, DeleteFeedPostPawPort {

    private final FeedPostPawRepository repository;

    public FeedPostPawPersistenceAdapter(FeedPostPawRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Long> countByPostIds(List<Long> postIds) {
        Map<Long, Long> result = new HashMap<>();
        if (postIds == null || postIds.isEmpty()) {
            return result;
        }
        for (Object[] row : repository.countGroupedByPostIds(postIds)) {
            result.put((Long) row[0], (Long) row[1]);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> findPawedPostIds(Long userId, List<Long> postIds) {
        if (userId == null || postIds == null || postIds.isEmpty()) {
            return List.of();
        }
        return repository.findPostIdsByUserIdAndPostIdIn(userId, postIds);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByPostIdAndUserId(Long postId, Long userId) {
        return repository.existsByPostIdAndUserId(postId, userId);
    }

    @Override
    @Transactional
    public void save(Long postId, Long userId) {
        repository.save(new FeedPostPaw(postId, userId));
    }

    @Override
    @Transactional
    public void deleteByPostIdAndUserId(Long postId, Long userId) {
        repository.deleteByPostIdAndUserId(postId, userId);
    }
}
