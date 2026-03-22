package io.pet.petyard.feed.application.service;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.feed.application.model.FeedPostCommentView;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostCommentPort;
import io.pet.petyard.feed.domain.model.FeedPostComment;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedCommentApplicationService {

    private final LoadFeedPostPort loadFeedPostPort;
    private final LoadFeedPostCommentPort loadFeedPostCommentPort;
    private final SaveFeedPostCommentPort saveFeedPostCommentPort;
    private final LoadUserProfilePort loadUserProfilePort;

    public FeedCommentApplicationService(LoadFeedPostPort loadFeedPostPort,
                                         LoadFeedPostCommentPort loadFeedPostCommentPort,
                                         SaveFeedPostCommentPort saveFeedPostCommentPort,
                                         LoadUserProfilePort loadUserProfilePort) {
        this.loadFeedPostPort = loadFeedPostPort;
        this.loadFeedPostCommentPort = loadFeedPostCommentPort;
        this.saveFeedPostCommentPort = saveFeedPostCommentPort;
        this.loadUserProfilePort = loadUserProfilePort;
    }

    @Transactional(readOnly = true)
    public List<FeedPostCommentView> listComments(Long postId) {
        ensurePostExists(postId);
        return toViews(loadFeedPostCommentPort.findByPostId(postId));
    }

    @Transactional
    public FeedPostCommentView addComment(Long userId, Long postId, String content) {
        ensurePostExists(postId);
        String normalizedContent = normalizeContent(content);
        FeedPostComment saved = saveFeedPostCommentPort.save(new FeedPostComment(postId, userId, normalizedContent));
        return toViews(List.of(saved)).getFirst();
    }

    private void ensurePostExists(Long postId) {
        loadFeedPostPort.findById(postId).orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
    }

    private String normalizeContent(String content) {
        if (content == null) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        String trimmed = content.trim();
        if (trimmed.isBlank() || trimmed.length() > 300) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        return trimmed;
    }

    private List<FeedPostCommentView> toViews(List<FeedPostComment> comments) {
        Map<Long, UserProfile> profilesByUserId = new LinkedHashMap<>();
        loadUserProfilePort.findByUserIds(comments.stream().map(FeedPostComment::getUserId).distinct().toList())
            .forEach(profile -> profilesByUserId.put(profile.getUserId(), profile));
        return comments.stream()
            .map(comment -> {
                UserProfile authorProfile = profilesByUserId.get(comment.getUserId());
                return new FeedPostCommentView(
                    comment.getId(),
                    comment.getPostId(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getUserId(),
                    authorProfile == null ? "멍냥마당" : authorProfile.getNickname(),
                    authorProfile == null ? null : authorProfile.getProfileImageUrl()
                );
            })
            .toList();
    }
}
