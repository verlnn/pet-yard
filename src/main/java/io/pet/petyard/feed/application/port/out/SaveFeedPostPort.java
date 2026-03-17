package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.domain.model.FeedPost;

public interface SaveFeedPostPort {
    FeedPost save(FeedPost feedPost);
}
