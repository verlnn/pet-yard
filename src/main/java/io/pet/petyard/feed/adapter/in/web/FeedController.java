package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.storage.LocalFileStorage;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.service.FeedApplicationService;

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
    @GetMapping("/me")
    public List<FeedPostResponse> myFeed(@AuthenticationPrincipal AuthPrincipal principal) {
        List<FeedPostView> posts = feedApplicationService.listMyFeed(principal.userId());
        return posts.stream()
            .map(FeedPostResponse::from)
            .toList();
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FeedPostResponse create(@AuthenticationPrincipal AuthPrincipal principal,
                                   @RequestParam(required = false) String content,
                                   @RequestParam(required = false) Double imageAspectRatioValue,
                                   @RequestParam(required = false) String imageAspectRatio,
                                   @RequestParam(required = false) List<String> hashtags,
                                   @RequestParam(required = false) MultipartFile image) {
        String imageUrl = localFileStorage.saveFeedImage(image);
        FeedPostView post = feedApplicationService.create(
            principal.userId(),
            content,
            imageUrl,
            imageAspectRatioValue,
            imageAspectRatio,
            hashtags
        );
        return FeedPostResponse.from(post);
    }

    @RequirePermission(Permission.FEED_CREATE)
    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        feedApplicationService.delete(principal.userId(), id);
    }
}
