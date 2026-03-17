package io.pet.petyard.feed.application.port.out;

import java.util.List;

public interface SaveFeedPostHashtagPort {
    void saveTags(Long postId, List<String> tags);
}
