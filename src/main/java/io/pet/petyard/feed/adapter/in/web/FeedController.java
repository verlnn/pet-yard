package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.storage.LocalFileStorage;
import io.pet.petyard.feed.application.model.FeedPostImageCommand;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.service.FeedApplicationService;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/feeds")
public class FeedController {

    private final FeedApplicationService feedApplicationService;
    private final LocalFileStorage localFileStorage;

    public FeedController(FeedApplicationService feedApplicationService,
                          LocalFileStorage localFileStorage) {
        this.feedApplicationService = feedApplicationService;
        this.localFileStorage = localFileStorage;
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/own-posts")
    public List<FeedPostResponse> ownPosts(@AuthenticationPrincipal AuthPrincipal principal) {
        List<FeedPostView> posts = feedApplicationService.listMyFeed(principal.userId());
        return posts.stream()
            .map(FeedPostResponse::from)
            .toList();
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FeedPostResponse create(@AuthenticationPrincipal AuthPrincipal principal,
                                   @RequestParam(required = false) String content,
                                   @RequestParam(required = false) List<Double> imageAspectRatioValue,
                                   @RequestParam(required = false) List<String> imageAspectRatio,
                                   @RequestParam(required = false) List<String> hashtags,
                                   @RequestParam(required = false) List<MultipartFile> images) {
        List<FeedPostImageCommand> imageCommands = new ArrayList<>();
        if (images != null) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                Double aspectRatioValue = imageAspectRatioValue != null && i < imageAspectRatioValue.size()
                    ? imageAspectRatioValue.get(i)
                    : null;
                String aspectRatio = imageAspectRatio != null && i < imageAspectRatio.size()
                    ? imageAspectRatio.get(i)
                    : null;
                String imageUrl = localFileStorage.saveFeedImage(image, aspectRatioValue, aspectRatio);
                if (imageUrl == null || imageUrl.isBlank()) {
                    continue;
                }
                String imageContent = image.getOriginalFilename();
                imageCommands.add(new FeedPostImageCommand(
                    imageUrl,
                    imageContent,
                    aspectRatioValue,
                    aspectRatio,
                    i
                ));
            }
        }
        FeedPostView post = feedApplicationService.create(
            principal.userId(),
            content,
            imageCommands,
            hashtags
        );
        return FeedPostResponse.from(post);
    }

    @RequirePermission(Permission.FEED_READ)
    @PostMapping("/{id}/paws")
    public FeedPostPawResponse addPaw(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        return FeedPostPawResponse.from(feedApplicationService.addPaw(principal.userId(), id));
    }

    @RequirePermission(Permission.FEED_READ)
    @DeleteMapping("/{id}/paws")
    public FeedPostPawResponse removePaw(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        return FeedPostPawResponse.from(feedApplicationService.removePaw(principal.userId(), id));
    }

    @RequirePermission(Permission.FEED_CREATE)
    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        feedApplicationService.delete(principal.userId(), id);
    }
}
