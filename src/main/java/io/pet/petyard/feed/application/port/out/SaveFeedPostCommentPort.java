package io.pet.petyard.feed.application.port.out;

import io.pet.petyard.feed.domain.model.FeedPostComment;

public interface SaveFeedPostCommentPort {
    FeedPostComment save(FeedPostComment comment);
}
