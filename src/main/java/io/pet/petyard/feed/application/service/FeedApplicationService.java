package io.pet.petyard.feed.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.model.FeedPostImageCommand;
import io.pet.petyard.feed.application.model.FeedPostPawResult;
import io.pet.petyard.feed.application.model.HomeFeedAuthorView;
import io.pet.petyard.feed.application.model.HomeFeedImageView;
import io.pet.petyard.feed.application.model.HomeFeedMediaView;
import io.pet.petyard.feed.application.model.HomeFeedPostView;
import io.pet.petyard.feed.application.model.HomeFeedReactionView;
import io.pet.petyard.feed.application.model.HomeFeedSlice;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostPort;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.feed.domain.model.FeedPost;
import io.pet.petyard.feed.domain.model.FeedPostImage;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;

import java.util.ArrayList;
import java.util.Collections;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedApplicationService {

    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#([\\p{L}0-9_]{1,50})");
    private static final Logger log = LoggerFactory.getLogger(FeedApplicationService.class);

    private final LoadFeedPostPort loadFeedPostPort;
    private final SaveFeedPostPort saveFeedPostPort;
    private final DeleteFeedPostPort deleteFeedPostPort;
    private final SaveFeedPostImagePort saveFeedPostImagePort;
    private final LoadFeedPostImagePort loadFeedPostImagePort;
    private final SaveFeedPostPawPort saveFeedPostPawPort;
    private final LoadFeedPostPawPort loadFeedPostPawPort;
    private final DeleteFeedPostPawPort deleteFeedPostPawPort;
    private final SaveFeedPostHashtagPort saveFeedPostHashtagPort;
    private final LoadFeedPostHashtagPort loadFeedPostHashtagPort;
    private final LoadFeedPostCommentPort loadFeedPostCommentPort;
    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    private final LoadUserPort loadUserPort;
    private final FeedProperties feedProperties;

    public FeedApplicationService(LoadFeedPostPort loadFeedPostPort,
                                  SaveFeedPostPort saveFeedPostPort,
                                  DeleteFeedPostPort deleteFeedPostPort,
                                  SaveFeedPostImagePort saveFeedPostImagePort,
                                  LoadFeedPostImagePort loadFeedPostImagePort,
                                  SaveFeedPostPawPort saveFeedPostPawPort,
                                  LoadFeedPostPawPort loadFeedPostPawPort,
                                  DeleteFeedPostPawPort deleteFeedPostPawPort,
                                  SaveFeedPostHashtagPort saveFeedPostHashtagPort,
                                  LoadFeedPostHashtagPort loadFeedPostHashtagPort,
                                  LoadFeedPostCommentPort loadFeedPostCommentPort,
                                  LoadUserProfilePort loadUserProfilePort,
                                  LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                  LoadUserPort loadUserPort,
                                  FeedProperties feedProperties) {
        this.loadFeedPostPort = loadFeedPostPort;
        this.saveFeedPostPort = saveFeedPostPort;
        this.deleteFeedPostPort = deleteFeedPostPort;
        this.saveFeedPostImagePort = saveFeedPostImagePort;
        this.loadFeedPostImagePort = loadFeedPostImagePort;
        this.saveFeedPostPawPort = saveFeedPostPawPort;
        this.loadFeedPostPawPort = loadFeedPostPawPort;
        this.deleteFeedPostPawPort = deleteFeedPostPawPort;
        this.saveFeedPostHashtagPort = saveFeedPostHashtagPort;
        this.loadFeedPostHashtagPort = loadFeedPostHashtagPort;
        this.loadFeedPostCommentPort = loadFeedPostCommentPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.loadUserPort = loadUserPort;
        this.feedProperties = feedProperties;
    }

    @Transactional(readOnly = true)
    public List<FeedPostView> listMyFeed(Long userId) {
        return listUserFeed(userId, userId);
    }

    @Transactional(readOnly = true)
    public List<FeedPostView> listUserFeed(Long targetUserId, Long viewerUserId) {
        List<FeedPost> posts = loadFeedPostPort.findByUserId(targetUserId);
        if (posts.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> postIds = posts.stream().map(FeedPost::getId).toList();
        Map<Long, List<FeedPostImage>> imagesByPost = loadFeedPostImagePort.findByPostIds(postIds);
        Map<Long, Long> pawCountsByPost = loadFeedPostPawPort.countByPostIds(postIds);
        Set<Long> pawedPostIds = new HashSet<>(loadFeedPostPawPort.findPawedPostIds(viewerUserId, postIds));
        Map<Long, List<String>> tagsByPost = loadFeedPostHashtagPort.findTagNamesByPostIds(postIds);
        List<FeedPostView> result = new ArrayList<>();
        for (FeedPost post : posts) {
            List<FeedPostImage> postImages = imagesByPost.getOrDefault(post.getId(), List.of());
            List<String> imageUrls = postImages
                .stream()
                .map(FeedPostImage::getImageUrl)
                .toList();
            List<String> tags = tagsByPost.getOrDefault(post.getId(), List.of());
            result.add(new FeedPostView(
                post.getId(),
                post.getContent(),
                imageUrls.isEmpty() ? null : imageUrls.getFirst(),
                imageUrls,
                post.getImageAspectRatioValue(),
                post.getImageAspectRatio(),
                pawCountsByPost.getOrDefault(post.getId(), 0L),
                pawedPostIds.contains(post.getId()),
                post.getCreatedAt(),
                tags
            ));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public HomeFeedSlice listHomeFeed(Long userId, Instant cursorCreatedAt, Long cursorId, Integer limit) {
        FeedHomeRequestTrace trace = FeedHomeRequestTrace.start();
        int pageSize = feedProperties.resolvePageSize(limit);
        List<FeedPost> posts = loadFeedPostPort.findHomeFeedPage(cursorCreatedAt, cursorId, pageSize + 1);
        trace = trace.markPostsLoaded();
        if (posts.isEmpty()) {
            log.info(
                "home_feed_request userId={} pageSize={} hasCursor={} itemCount=0 hasMore=false postQueryMs={} relatedQueryMs={} assemblyMs={} totalMs={}",
                userId,
                pageSize,
                cursorCreatedAt != null && cursorId != null,
                trace.postQueryMillis(),
                trace.relatedQueryMillis(),
                trace.assemblyMillis(),
                trace.totalMillis()
            );
            return new HomeFeedSlice(List.of(), null, null, false);
        }

        boolean hasMore = posts.size() > pageSize;
        List<FeedPost> pagePosts = hasMore ? posts.subList(0, pageSize) : posts;
        List<Long> postIds = pagePosts.stream().map(FeedPost::getId).toList();
        Map<Long, List<FeedPostImage>> imagesByPost = loadFeedPostImagePort.findByPostIds(postIds);
        Map<Long, Long> pawCountsByPost = loadFeedPostPawPort.countByPostIds(postIds);
        Set<Long> pawedPostIds = new HashSet<>(loadFeedPostPawPort.findPawedPostIds(userId, postIds));
        Map<Long, Long> commentCountsByPost = loadFeedPostCommentPort.countByPostIds(postIds);
        Map<Long, List<String>> tagsByPost = loadFeedPostHashtagPort.findTagNamesByPostIds(postIds);
        Set<Long> authorIds = pagePosts.stream().map(FeedPost::getUserId).collect(java.util.stream.Collectors.toSet());
        Map<Long, UserProfile> profilesByUserId = loadUserProfilePort.findByUserIds(authorIds)
            .stream()
            .collect(java.util.stream.Collectors.toMap(UserProfile::getUserId, profile -> profile));
        Map<Long, User> usersById = loadUserPort.findByIds(authorIds)
            .stream()
            .collect(java.util.stream.Collectors.toMap(User::getId, user -> user));
        Set<Long> guardianRegisteredAuthorIds = new HashSet<>(
            loadGuardianRegistrationPort.findRegisteredTargetUserIds(
                userId,
                authorIds.stream().toList()
            )
        );
        trace = trace.markRelatedDataLoaded();

        List<HomeFeedPostView> result = new ArrayList<>();
        for (FeedPost post : pagePosts) {
            List<FeedPostImage> postImages = imagesByPost.getOrDefault(post.getId(), List.of());
            List<String> imageUrls = postImages.stream().map(FeedPostImage::getImageUrl).toList();
            UserProfile authorProfile = profilesByUserId.get(post.getUserId());
            User author = usersById.get(post.getUserId());
            result.add(new HomeFeedPostView(
                post.getId(),
                post.getContent(),
                post.getCreatedAt(),
                tagsByPost.getOrDefault(post.getId(), List.of()),
                new HomeFeedAuthorView(
                    post.getUserId(),
                    author == null ? null : author.getUsername(),
                    authorProfile == null ? "멍냥마당" : authorProfile.getNickname(),
                    authorProfile == null ? null : authorProfile.getProfileImageUrl(),
                    guardianRegisteredAuthorIds.contains(post.getUserId())
                ),
                new HomeFeedMediaView(
                    imageUrls.isEmpty() ? null : imageUrls.getFirst(),
                    imageUrls,
                    postImages.stream()
                        .map(image -> new HomeFeedImageView(
                            image.getImageUrl(),
                            image.getImageUrl(),
                            image.getImageUrl(),
                            null,
                            null,
                            image.getImageAspectRatioValue(),
                            image.getImageAspectRatio()
                        ))
                        .toList(),
                    post.getImageAspectRatioValue(),
                    post.getImageAspectRatio()
                ),
                new HomeFeedReactionView(
                    pawCountsByPost.getOrDefault(post.getId(), 0L),
                    pawedPostIds.contains(post.getId()),
                    commentCountsByPost.getOrDefault(post.getId(), 0L)
                )
            ));
        }
        trace = trace.markAssemblyFinished();

        FeedPost lastPost = pagePosts.getLast();
        log.info(
            "home_feed_request userId={} pageSize={} hasCursor={} itemCount={} hasMore={} postQueryMs={} relatedQueryMs={} assemblyMs={} totalMs={}",
            userId,
            pageSize,
            cursorCreatedAt != null && cursorId != null,
            pagePosts.size(),
            hasMore,
            trace.postQueryMillis(),
            trace.relatedQueryMillis(),
            trace.assemblyMillis(),
            trace.totalMillis()
        );
        return new HomeFeedSlice(
            result,
            hasMore ? lastPost.getCreatedAt() : null,
            hasMore ? lastPost.getId() : null,
            hasMore
        );
    }

    @Transactional
    public FeedPostView create(Long userId,
                               String content,
                               List<FeedPostImageCommand> images,
                               List<String> hashtags) {
        List<FeedPostImageCommand> safeImages = images == null ? List.of() : images.stream()
            .filter(image -> image.imageUrl() != null && !image.imageUrl().isBlank())
            .toList();
        FeedPostImageCommand primaryImage = safeImages.isEmpty() ? null : safeImages.get(0);
        boolean hasImage = primaryImage != null;
        if (!hasImage) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        FeedPost feedPost = new FeedPost(
            userId,
            content,
            primaryImage != null ? primaryImage.imageAspectRatioValue() : null,
            primaryImage != null ? primaryImage.imageAspectRatio() : null
        );
        FeedPost saved = saveFeedPostPort.save(feedPost);
        saveFeedPostImagePort.saveImages(saved.getId(), safeImages);

        List<String> normalizedTags = normalizeTags(content, hashtags);
        if (!normalizedTags.isEmpty()) {
            saveFeedPostHashtagPort.saveTags(saved.getId(), normalizedTags);
        }

        return new FeedPostView(
            saved.getId(),
            saved.getContent(),
            primaryImage != null ? primaryImage.imageUrl() : null,
            safeImages.stream().map(FeedPostImageCommand::imageUrl).toList(),
            saved.getImageAspectRatioValue(),
            saved.getImageAspectRatio(),
            0,
            false,
            saved.getCreatedAt(),
            normalizedTags
        );
    }

    @Transactional
    public void delete(Long userId, Long postId) {
        FeedPost post = loadFeedPostPort.findByIdAndUserId(postId, userId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        deleteFeedPostPort.deleteById(post.getId());
    }

    @Transactional
    public FeedPostPawResult addPaw(Long userId, Long postId) {
        FeedPost post = loadFeedPostPort.findById(postId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        if (!loadFeedPostPawPort.existsByPostIdAndUserId(post.getId(), userId)) {
            saveFeedPostPawPort.save(post.getId(), userId);
        }
        long pawCount = loadFeedPostPawPort.countByPostIds(List.of(post.getId())).getOrDefault(post.getId(), 0L);
        return new FeedPostPawResult(post.getId(), pawCount, true);
    }

    @Transactional
    public FeedPostPawResult removePaw(Long userId, Long postId) {
        FeedPost post = loadFeedPostPort.findById(postId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        deleteFeedPostPawPort.deleteByPostIdAndUserId(post.getId(), userId);
        long pawCount = loadFeedPostPawPort.countByPostIds(List.of(post.getId())).getOrDefault(post.getId(), 0L);
        return new FeedPostPawResult(post.getId(), pawCount, false);
    }

    private List<String> normalizeTags(String content, List<String> inputTags) {
        Set<String> tags = new HashSet<>();

        if (content != null && !content.isBlank()) {
            Matcher matcher = HASHTAG_PATTERN.matcher(content);
            while (matcher.find()) {
                String tag = matcher.group(1);
                if (tag != null && !tag.isBlank()) {
                    tags.add(tag.toLowerCase(Locale.ROOT));
                }
            }
        }

        if (inputTags != null) {
            for (String raw : inputTags) {
                if (raw == null) continue;
                String tag = raw.trim();
                if (tag.startsWith("#")) {
                    tag = tag.substring(1);
                }
                if (tag.isBlank()) continue;
                if (tag.length() > 50) {
                    tag = tag.substring(0, 50);
                }
                tags.add(tag.toLowerCase(Locale.ROOT));
            }
        }

        return new ArrayList<>(tags);
    }
}
