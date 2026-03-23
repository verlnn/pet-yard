package io.pet.petyard.feed.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.feed.application.model.FeedPostCommentView;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostCommentPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostCommentPawPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostCommentPort;
import io.pet.petyard.feed.domain.model.FeedPost;
import io.pet.petyard.feed.domain.model.FeedPostComment;
import io.pet.petyard.notification.application.port.out.SaveUserNotificationPort;
import io.pet.petyard.notification.domain.NotificationType;
import io.pet.petyard.notification.domain.model.UserNotification;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.domain.model.UserProfile;
import io.pet.petyard.user.domain.model.UserProfileSettings;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedCommentApplicationService {

    private final LoadFeedPostPort loadFeedPostPort;
    private final LoadFeedPostCommentPort loadFeedPostCommentPort;
    private final SaveFeedPostCommentPort saveFeedPostCommentPort;
    private final LoadFeedPostCommentPawPort loadFeedPostCommentPawPort;
    private final SaveFeedPostCommentPawPort saveFeedPostCommentPawPort;
    private final DeleteFeedPostCommentPawPort deleteFeedPostCommentPawPort;
    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadUserPort loadUserPort;
    private final LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    private final LoadPetProfilePort loadPetProfilePort;
    private final SaveUserNotificationPort saveUserNotificationPort;

    public FeedCommentApplicationService(LoadFeedPostPort loadFeedPostPort,
                                         LoadFeedPostCommentPort loadFeedPostCommentPort,
                                         SaveFeedPostCommentPort saveFeedPostCommentPort,
                                         LoadFeedPostCommentPawPort loadFeedPostCommentPawPort,
                                         SaveFeedPostCommentPawPort saveFeedPostCommentPawPort,
                                         DeleteFeedPostCommentPawPort deleteFeedPostCommentPawPort,
                                         LoadUserProfilePort loadUserProfilePort,
                                         LoadUserPort loadUserPort,
                                         LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                         LoadPetProfilePort loadPetProfilePort,
                                         SaveUserNotificationPort saveUserNotificationPort) {
        this.loadFeedPostPort = loadFeedPostPort;
        this.loadFeedPostCommentPort = loadFeedPostCommentPort;
        this.saveFeedPostCommentPort = saveFeedPostCommentPort;
        this.loadFeedPostCommentPawPort = loadFeedPostCommentPawPort;
        this.saveFeedPostCommentPawPort = saveFeedPostCommentPawPort;
        this.deleteFeedPostCommentPawPort = deleteFeedPostCommentPawPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadUserPort = loadUserPort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.loadPetProfilePort = loadPetProfilePort;
        this.saveUserNotificationPort = saveUserNotificationPort;
    }

    @Transactional(readOnly = true)
    public List<FeedPostCommentView> listComments(Long viewerUserId, Long postId) {
        ensurePostExists(postId);
        return toViews(viewerUserId, loadFeedPostCommentPort.findByPostId(postId));
    }

    @Transactional
    public FeedPostCommentView addComment(Long userId, Long postId, Long parentCommentId, String content) {
        FeedPost post = ensurePostExists(postId);
        String normalizedContent = normalizeContent(content);
        FeedPostComment parentComment = validateParentComment(postId, parentCommentId);
        FeedPostComment saved = saveFeedPostCommentPort.save(new FeedPostComment(postId, userId, parentCommentId, normalizedContent));
        notifyCommentCreated(userId, post, parentComment);
        return toViews(userId, List.of(saved)).getFirst();
    }

    @Transactional
    public FeedPostCommentView addPaw(Long userId, Long commentId) {
        FeedPostComment comment = loadFeedPostCommentPort.findById(commentId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        if (!loadFeedPostCommentPawPort.existsByCommentIdAndUserId(commentId, userId)) {
            saveFeedPostCommentPawPort.save(commentId, userId);
            if (!userId.equals(comment.getUserId())) {
                saveUserNotificationPort.save(new UserNotification(comment.getUserId(), userId, NotificationType.PAW_ON_COMMENT));
            }
        }
        return toViews(userId, List.of(comment)).getFirst();
    }

    @Transactional
    public FeedPostCommentView removePaw(Long userId, Long commentId) {
        FeedPostComment comment = loadFeedPostCommentPort.findById(commentId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        deleteFeedPostCommentPawPort.deleteByCommentIdAndUserId(commentId, userId);
        return toViews(userId, List.of(comment)).getFirst();
    }

    private FeedPost ensurePostExists(Long postId) {
        return loadFeedPostPort.findById(postId).orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
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

    private FeedPostComment validateParentComment(Long postId, Long parentCommentId) {
        if (parentCommentId == null) {
            return null;
        }
        FeedPostComment parentComment = loadFeedPostCommentPort.findById(parentCommentId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        if (!postId.equals(parentComment.getPostId())) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        return parentComment;
    }

    private void notifyCommentCreated(Long userId, FeedPost post, FeedPostComment parentComment) {
        if (!userId.equals(post.getUserId())) {
            saveUserNotificationPort.save(new UserNotification(post.getUserId(), userId, NotificationType.COMMENT_ON_POST));
        }
        if (parentComment != null && !userId.equals(parentComment.getUserId()) && !post.getUserId().equals(parentComment.getUserId())) {
            saveUserNotificationPort.save(new UserNotification(parentComment.getUserId(), userId, NotificationType.COMMENT_REPLY));
        }
    }

    private List<FeedPostCommentView> toViews(Long viewerUserId, List<FeedPostComment> comments) {
        Map<Long, FeedPostComment> commentsById = comments.stream()
            .collect(java.util.stream.Collectors.toMap(FeedPostComment::getId, comment -> comment));
        comments.stream()
            .map(FeedPostComment::getParentCommentId)
            .filter(parentCommentId -> parentCommentId != null && !commentsById.containsKey(parentCommentId))
            .forEach(parentCommentId -> loadFeedPostCommentPort.findById(parentCommentId)
                .ifPresent(parentComment -> commentsById.put(parentComment.getId(), parentComment)));
        Set<Long> authorIds = commentsById.values().stream()
            .map(FeedPostComment::getUserId)
            .collect(java.util.stream.Collectors.toSet());
        Map<Long, User> usersById = new LinkedHashMap<>();
        loadUserPort.findByIds(authorIds).forEach(user -> usersById.put(user.getId(), user));
        Map<Long, UserProfile> profilesByUserId = new LinkedHashMap<>();
        loadUserProfilePort.findByUserIds(authorIds)
            .forEach(profile -> profilesByUserId.put(profile.getUserId(), profile));
        Map<Long, Long> pawCountsByCommentId = loadFeedPostCommentPawPort.countByCommentIds(comments.stream().map(FeedPostComment::getId).toList());
        Set<Long> pawedCommentIds = new java.util.HashSet<>(loadFeedPostCommentPawPort.findPawedCommentIds(
            viewerUserId,
            comments.stream().map(FeedPostComment::getId).toList()
        ));
        Map<Long, String> primaryPetImageUrlByUserId = new LinkedHashMap<>();
        authorIds.forEach(userId -> primaryPetImageUrlByUserId.put(userId, resolvePrimaryPetPhotoUrl(userId)));
        return comments.stream()
            .map(comment -> {
                User author = usersById.get(comment.getUserId());
                UserProfile authorProfile = profilesByUserId.get(comment.getUserId());
                FeedPostComment parentComment = comment.getParentCommentId() == null ? null : commentsById.get(comment.getParentCommentId());
                User replyToUser = parentComment == null ? null : usersById.get(parentComment.getUserId());
                return new FeedPostCommentView(
                    comment.getId(),
                    comment.getPostId(),
                    comment.getParentCommentId(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getUserId(),
                    author == null ? null : author.getUsername(),
                    authorProfile == null ? "멍냥마당" : authorProfile.getNickname(),
                    authorProfile == null ? null : authorProfile.getProfileImageUrl(),
                    primaryPetImageUrlByUserId.get(comment.getUserId()),
                    replyToUser == null ? null : replyToUser.getUsername(),
                    pawCountsByCommentId.getOrDefault(comment.getId(), 0L),
                    pawedCommentIds.contains(comment.getId())
                );
            })
            .toList();
    }

    private String resolvePrimaryPetPhotoUrl(Long userId) {
        UserProfileSettings settings = loadUserProfileSettingsPort.findByUserId(userId).orElse(null);
        List<PetProfile> pets = loadPetProfilePort.findByUserId(userId);
        if (pets.isEmpty()) {
            return null;
        }
        if (settings != null && settings.getPrimaryPetId() != null) {
            return pets.stream()
                .filter(pet -> settings.getPrimaryPetId().equals(pet.getId()))
                .map(PetProfile::getPhotoUrl)
                .filter(photoUrl -> photoUrl != null && !photoUrl.isBlank())
                .findFirst()
                .orElseGet(() -> pets.stream()
                    .map(PetProfile::getPhotoUrl)
                    .filter(photoUrl -> photoUrl != null && !photoUrl.isBlank())
                    .findFirst()
                    .orElse(null));
        }
        return pets.stream()
            .map(PetProfile::getPhotoUrl)
            .filter(photoUrl -> photoUrl != null && !photoUrl.isBlank())
            .findFirst()
            .orElse(null);
    }
}
