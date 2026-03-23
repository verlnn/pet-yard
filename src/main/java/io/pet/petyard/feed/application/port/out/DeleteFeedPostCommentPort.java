package io.pet.petyard.feed.application.port.out;

import java.util.Collection;

public interface DeleteFeedPostCommentPort {
    void deleteByIds(Collection<Long> commentIds);
}
