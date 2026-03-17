package io.pet.petyard.feed.application.port.out;

import java.util.List;
import java.util.Map;

public interface LoadFeedPostHashtagPort {
    Map<Long, List<String>> findTagNamesByPostIds(List<Long> postIds);
}
