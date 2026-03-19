package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.application.model.FeedPostImageCommand;

import java.util.List;

public interface SaveFeedPostImagePort {
    void saveImages(Long postId, List<FeedPostImageCommand> images);
}
