package io.pet.petyard.feed.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.feed.application.model.FeedPostCommentView;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostCommentPort;
import io.pet.petyard.feed.domain.model.FeedPostComment;
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
    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadUserPort loadUserPort;
    private final LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    private final LoadPetProfilePort loadPetProfilePort;

    public FeedCommentApplicationService(LoadFeedPostPort loadFeedPostPort,
                                         LoadFeedPostCommentPort loadFeedPostCommentPort,
                                         SaveFeedPostCommentPort saveFeedPostCommentPort,
                                         LoadUserProfilePort loadUserProfilePort,
                                         LoadUserPort loadUserPort,
                                         LoadUserProfileSettingsPort loadUserProfileSettingsPort,
                                         LoadPetProfilePort loadPetProfilePort) {
        this.loadFeedPostPort = loadFeedPostPort;
        this.loadFeedPostCommentPort = loadFeedPostCommentPort;
        this.saveFeedPostCommentPort = saveFeedPostCommentPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadUserPort = loadUserPort;
        this.loadUserProfileSettingsPort = loadUserProfileSettingsPort;
        this.loadPetProfilePort = loadPetProfilePort;
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
        Set<Long> authorIds = comments.stream().map(FeedPostComment::getUserId).collect(java.util.stream.Collectors.toSet());
        Map<Long, User> usersById = new LinkedHashMap<>();
        loadUserPort.findByIds(authorIds).forEach(user -> usersById.put(user.getId(), user));
        Map<Long, UserProfile> profilesByUserId = new LinkedHashMap<>();
        loadUserProfilePort.findByUserIds(authorIds)
            .forEach(profile -> profilesByUserId.put(profile.getUserId(), profile));
        Map<Long, String> primaryPetImageUrlByUserId = new LinkedHashMap<>();
        authorIds.forEach(userId -> primaryPetImageUrlByUserId.put(userId, resolvePrimaryPetPhotoUrl(userId)));
        return comments.stream()
            .map(comment -> {
                User author = usersById.get(comment.getUserId());
                UserProfile authorProfile = profilesByUserId.get(comment.getUserId());
                return new FeedPostCommentView(
                    comment.getId(),
                    comment.getPostId(),
                    comment.getContent(),
                    comment.getCreatedAt(),
                    comment.getUserId(),
                    author == null ? null : author.getUsername(),
                    authorProfile == null ? "멍냥마당" : authorProfile.getNickname(),
                    authorProfile == null ? null : authorProfile.getProfileImageUrl(),
                    primaryPetImageUrlByUserId.get(comment.getUserId())
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
