package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.port.out.DeleteFeedPostPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPort;
import io.pet.petyard.feed.domain.model.FeedPost;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class FeedPostPersistenceAdapter implements LoadFeedPostPort, SaveFeedPostPort, DeleteFeedPostPort {

    private final FeedPostRepository repository;

    public FeedPostPersistenceAdapter(FeedPostRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<FeedPost> findByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public List<FeedPost> findHomeFeedPage(Instant cursorCreatedAt, Long cursorId, int limit) {
        return repository.findHomeFeedPage(cursorCreatedAt, cursorId, PageRequest.of(0, limit));
    }

    @Override
    public Optional<FeedPost> findById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<FeedPost> findByIdAndUserId(Long id, Long userId) {
        return repository.findByIdAndUserId(id, userId);
    }

    @Override
    public FeedPost save(FeedPost feedPost) {
        return repository.save(feedPost);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
