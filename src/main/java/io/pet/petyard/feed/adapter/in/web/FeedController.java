package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.service.FeedApplicationService;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feeds")
public class FeedController {

    private final FeedApplicationService feedApplicationService;

    public FeedController(FeedApplicationService feedApplicationService) {
        this.feedApplicationService = feedApplicationService;
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
    @PostMapping
    public FeedPostResponse create(@AuthenticationPrincipal AuthPrincipal principal,
                                   @Valid @RequestBody FeedPostRequest request) {
        FeedPostView post = feedApplicationService.create(
            principal.userId(),
            request.content(),
            request.imageUrl(),
            request.imageAspectRatioValue(),
            request.imageAspectRatio(),
            request.hashtags()
        );
        return FeedPostResponse.from(post);
    }

    @RequirePermission(Permission.FEED_CREATE)
    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        feedApplicationService.delete(principal.userId(), id);
    }
}
