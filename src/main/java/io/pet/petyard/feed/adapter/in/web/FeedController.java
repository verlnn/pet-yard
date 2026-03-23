package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.domain.Username;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.storage.LocalFileStorage;
import io.pet.petyard.feed.application.model.HomeFeedSlice;
import io.pet.petyard.feed.application.model.FeedPostImageCommand;
import io.pet.petyard.feed.application.model.FeedPostView;
import io.pet.petyard.feed.application.service.FeedCommentApplicationService;
import io.pet.petyard.feed.application.service.FeedApplicationService;
import io.pet.petyard.auth.security.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.ArrayList;
import java.time.Instant;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feeds")
@Tag(name = "Feed", description = "홈 피드 조회, 내 게시물 조회, 게시물 생성/삭제, 발자국 반응 API")
@SecurityRequirement(name = "bearerAuth")
public class FeedController {

    private final FeedApplicationService feedApplicationService;
    private final FeedCommentApplicationService feedCommentApplicationService;
    private final LocalFileStorage localFileStorage;
    private final LoadUserPort loadUserPort;

    public FeedController(FeedApplicationService feedApplicationService,
                          FeedCommentApplicationService feedCommentApplicationService,
                          LocalFileStorage localFileStorage,
                          LoadUserPort loadUserPort) {
        this.feedApplicationService = feedApplicationService;
        this.feedCommentApplicationService = feedCommentApplicationService;
        this.localFileStorage = localFileStorage;
        this.loadUserPort = loadUserPort;
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping
    @Operation(summary = "홈 피드 조회", description = "cursor pagination으로 최신순 홈 피드를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = HomeFeedPageResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "피드 조회 권한 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public HomeFeedPageResponse homeFeed(@AuthenticationPrincipal AuthPrincipal principal,
                                         @Parameter(description = "다음 페이지 기준 createdAt", required = false)
                                         @RequestParam(required = false) Instant cursorCreatedAt,
                                         @Parameter(description = "동일 시각 tie-break용 게시물 id", required = false)
                                         @RequestParam(required = false) Long cursorId,
                                         @Parameter(description = "요청 페이지 크기. null 또는 0 이하이면 기본값 사용", required = false)
                                         @RequestParam(required = false) Integer limit) {
        HomeFeedSlice slice = feedApplicationService.listHomeFeed(principal.userId(), cursorCreatedAt, cursorId, limit);
        return new HomeFeedPageResponse(
            slice.items().stream().map(HomeFeedPostResponse::from).toList(),
            slice.hasMore() ? new HomeFeedCursorResponse(slice.nextCursorCreatedAt(), slice.nextCursorId()) : null,
            slice.hasMore()
        );
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/own-posts")
    @Operation(summary = "내 게시물 목록 조회", description = "현재 로그인 사용자가 작성한 게시물을 최신순으로 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = FeedPostResponse.class)))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<FeedPostResponse> ownPosts(@AuthenticationPrincipal AuthPrincipal principal) {
        List<FeedPostView> posts = feedApplicationService.listMyFeed(principal.userId());
        return posts.stream()
            .map(FeedPostResponse::from)
            .toList();
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/users/{username}")
    @Operation(summary = "특정 사용자 게시물 목록 조회", description = "공개 사용자 ID(username)로 특정 사용자의 게시물을 최신순으로 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = FeedPostResponse.class)))),
        @ApiResponse(responseCode = "400", description = "존재하지 않는 사용자",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<FeedPostResponse> userPosts(@AuthenticationPrincipal AuthPrincipal principal,
                                            @PathVariable String username) {
        String normalizedUsername;
        try {
            normalizedUsername = Username.fromRaw(username).value();
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.USER_NOT_FOUND);
        }
        Long targetUserId = loadUserPort.findByUsername(normalizedUsername)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND))
            .getId();
        return feedApplicationService.listUserFeed(targetUserId, principal.userId()).stream()
            .map(FeedPostResponse::from)
            .toList();
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "게시물 생성", description = "이미지와 본문, 해시태그를 포함한 게시물을 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "생성 성공",
            content = @Content(schema = @Schema(implementation = FeedPostResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 입력 또는 파일 처리 실패",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "게시물 생성 권한 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public FeedPostResponse create(@AuthenticationPrincipal AuthPrincipal principal,
                                   @Parameter(description = "게시물 본문", required = false)
                                   @RequestParam(required = false) String content,
                                   @Parameter(description = "이미지별 종횡비 값 목록", required = false)
                                   @RequestParam(required = false) List<Double> imageAspectRatioValue,
                                   @Parameter(description = "이미지별 종횡비 코드 목록", required = false)
                                   @RequestParam(required = false) List<String> imageAspectRatio,
                                   @Parameter(description = "명시적 해시태그 목록", required = false)
                                   @RequestParam(required = false) List<String> hashtags,
                                   @Parameter(description = "업로드 이미지 목록", required = false)
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
    @Operation(summary = "게시물 발자국 추가", description = "특정 게시물에 발자국 반응을 추가합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "추가 성공",
            content = @Content(schema = @Schema(implementation = FeedPostPawResponse.class))),
        @ApiResponse(responseCode = "400", description = "대상 게시물이 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public FeedPostPawResponse addPaw(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        return FeedPostPawResponse.from(feedApplicationService.addPaw(principal.userId(), id));
    }

    @RequirePermission(Permission.FEED_READ)
    @DeleteMapping("/{id}/paws")
    @Operation(summary = "게시물 발자국 취소", description = "특정 게시물의 발자국 반응을 제거합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "취소 성공",
            content = @Content(schema = @Schema(implementation = FeedPostPawResponse.class))),
        @ApiResponse(responseCode = "400", description = "대상 게시물이 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public FeedPostPawResponse removePaw(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        return FeedPostPawResponse.from(feedApplicationService.removePaw(principal.userId(), id));
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/{id}/comments")
    @Operation(summary = "게시물 댓글 목록 조회", description = "특정 게시물의 댓글을 오래된 순으로 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = FeedPostCommentResponse.class)))),
        @ApiResponse(responseCode = "400", description = "대상 게시물이 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<FeedPostCommentResponse> comments(@PathVariable Long id) {
        return feedCommentApplicationService.listComments(id).stream()
            .map(FeedPostCommentResponse::from)
            .toList();
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/{id}/comments")
    @Operation(summary = "게시물 댓글 작성", description = "특정 게시물에 댓글을 작성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "작성 성공",
            content = @Content(schema = @Schema(implementation = FeedPostCommentResponse.class))),
        @ApiResponse(responseCode = "400", description = "대상 게시물이 없거나 댓글 본문이 잘못됨",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public FeedPostCommentResponse addComment(@AuthenticationPrincipal AuthPrincipal principal,
                                              @PathVariable Long id,
                                              @Valid @RequestBody FeedPostCommentRequest request) {
        return FeedPostCommentResponse.from(
            feedCommentApplicationService.addComment(principal.userId(), id, request.content())
        );
    }

    @RequirePermission(Permission.FEED_CREATE)
    @DeleteMapping("/{id}")
    @Operation(summary = "게시물 삭제", description = "현재 로그인 사용자가 작성한 게시물을 삭제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "삭제 성공"),
        @ApiResponse(responseCode = "400", description = "삭제 대상이 없거나 본인 게시물이 아님",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "게시물 삭제 권한 없음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void delete(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        feedApplicationService.delete(principal.userId(), id);
    }
}
