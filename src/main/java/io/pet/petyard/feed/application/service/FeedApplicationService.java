package io.pet.petyard.feed.application.service;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.model.FeedPostImageCommand;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPort;
import io.pet.petyard.feed.domain.model.FeedPost;
import io.pet.petyard.feed.domain.model.FeedPostImage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedApplicationService {

    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#([\\p{L}0-9_]{1,50})");

    private final LoadFeedPostPort loadFeedPostPort;
    private final SaveFeedPostPort saveFeedPostPort;
    private final DeleteFeedPostPort deleteFeedPostPort;
    private final SaveFeedPostImagePort saveFeedPostImagePort;
    private final LoadFeedPostImagePort loadFeedPostImagePort;
    private final SaveFeedPostHashtagPort saveFeedPostHashtagPort;
    private final LoadFeedPostHashtagPort loadFeedPostHashtagPort;

    public FeedApplicationService(LoadFeedPostPort loadFeedPostPort,
                                  SaveFeedPostPort saveFeedPostPort,
                                  DeleteFeedPostPort deleteFeedPostPort,
                                  SaveFeedPostImagePort saveFeedPostImagePort,
                                  LoadFeedPostImagePort loadFeedPostImagePort,
                                  SaveFeedPostHashtagPort saveFeedPostHashtagPort,
                                  LoadFeedPostHashtagPort loadFeedPostHashtagPort) {
        this.loadFeedPostPort = loadFeedPostPort;
        this.saveFeedPostPort = saveFeedPostPort;
        this.deleteFeedPostPort = deleteFeedPostPort;
        this.saveFeedPostImagePort = saveFeedPostImagePort;
        this.loadFeedPostImagePort = loadFeedPostImagePort;
        this.saveFeedPostHashtagPort = saveFeedPostHashtagPort;
        this.loadFeedPostHashtagPort = loadFeedPostHashtagPort;
    }

    @Transactional(readOnly = true)
    public List<FeedPostView> listMyFeed(Long userId) {
        List<FeedPost> posts = loadFeedPostPort.findByUserId(userId);
        if (posts.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> postIds = posts.stream().map(FeedPost::getId).toList();
        Map<Long, List<FeedPostImage>> imagesByPost = loadFeedPostImagePort.findByPostIds(postIds);
        Map<Long, List<String>> tagsByPost = loadFeedPostHashtagPort.findTagNamesByPostIds(postIds);
        List<FeedPostView> result = new ArrayList<>();
        for (FeedPost post : posts) {
            List<FeedPostImage> postImages = imagesByPost.getOrDefault(post.getId(), List.of());
            List<String> imageUrls = postImages
                .stream()
                .map(FeedPostImage::getImageUrl)
                .toList();
            String displayContent = postImages.isEmpty() ? null : postImages.get(0).getContent();
            List<String> tags = tagsByPost.getOrDefault(post.getId(), List.of());
            result.add(new FeedPostView(
                post.getId(),
                displayContent,
                imageUrls.isEmpty() ? null : imageUrls.get(0),
                imageUrls,
                post.getImageAspectRatioValue(),
                post.getImageAspectRatio(),
                post.getCreatedAt(),
                tags
            ));
        }
        return result;
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
            primaryImage != null ? primaryImage.content() : null,
            primaryImage != null ? primaryImage.imageUrl() : null,
            safeImages.stream().map(FeedPostImageCommand::imageUrl).toList(),
            saved.getImageAspectRatioValue(),
            saved.getImageAspectRatio(),
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
