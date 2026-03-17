package io.pet.petyard.feed.application.service;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPort;
import io.pet.petyard.feed.domain.model.FeedPost;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedApplicationService {

    private final LoadFeedPostPort loadFeedPostPort;
    private final SaveFeedPostPort saveFeedPostPort;
    private final DeleteFeedPostPort deleteFeedPostPort;

    public FeedApplicationService(LoadFeedPostPort loadFeedPostPort,
                                  SaveFeedPostPort saveFeedPostPort,
                                  DeleteFeedPostPort deleteFeedPostPort) {
        this.loadFeedPostPort = loadFeedPostPort;
        this.saveFeedPostPort = saveFeedPostPort;
        this.deleteFeedPostPort = deleteFeedPostPort;
    }

    @Transactional(readOnly = true)
    public List<FeedPost> listMyFeed(Long userId) {
        return loadFeedPostPort.findByUserId(userId);
    }

    @Transactional
    public FeedPost create(Long userId, String content, String imageUrl) {
        boolean hasContent = content != null && !content.isBlank();
        boolean hasImage = imageUrl != null && !imageUrl.isBlank();
        if (!hasContent && !hasImage) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        FeedPost feedPost = new FeedPost(userId, content, imageUrl);
        return saveFeedPostPort.save(feedPost);
    }

    @Transactional
    public void delete(Long userId, Long postId) {
        FeedPost post = loadFeedPostPort.findByIdAndUserId(postId, userId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        deleteFeedPostPort.deleteById(post.getId());
    }
}
