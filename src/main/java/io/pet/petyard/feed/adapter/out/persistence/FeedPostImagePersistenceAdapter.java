package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.application.model.FeedPostImageCommand;
import io.pet.petyard.feed.application.port.out.LoadFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostImagePort;
import io.pet.petyard.feed.domain.model.FeedPostImage;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class FeedPostImagePersistenceAdapter implements LoadFeedPostImagePort, SaveFeedPostImagePort {

    private final FeedPostImageRepository repository;

    public FeedPostImagePersistenceAdapter(FeedPostImageRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<FeedPostImage>> findByPostIds(List<Long> postIds) {
        Map<Long, List<FeedPostImage>> result = new HashMap<>();
        if (postIds == null || postIds.isEmpty()) {
            return result;
        }
        List<FeedPostImage> images = repository.findByPostIdInOrderByPostIdAscSortOrderAsc(postIds);
        for (FeedPostImage image : images) {
            result.computeIfAbsent(image.getPostId(), key -> new ArrayList<>()).add(image);
        }
        return result;
    }

    @Override
    @Transactional
    public void saveImages(Long postId, List<FeedPostImageCommand> images) {
        if (postId == null || images == null || images.isEmpty()) {
            return;
        }

        List<FeedPostImage> entities = images.stream()
            .filter(image -> image.imageUrl() != null && !image.imageUrl().isBlank())
            .map(image -> new FeedPostImage(
                postId,
                image.imageUrl(),
                image.imageAspectRatioValue(),
                image.imageAspectRatio(),
                image.sortOrder()
            ))
            .toList();

        if (!entities.isEmpty()) {
            repository.saveAll(entities);
        }
    }
}
