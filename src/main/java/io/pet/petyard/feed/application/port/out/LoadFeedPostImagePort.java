package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.domain.model.FeedPostImage;

import java.util.List;
import java.util.Map;

public interface LoadFeedPostImagePort {
    Map<Long, List<FeedPostImage>> findByPostIds(List<Long> postIds);
}
