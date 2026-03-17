package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.port.out.DeleteFeedPostPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPort;
import io.pet.petyard.feed.domain.model.FeedPost;

import java.util.List;
import java.util.Optional;

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
