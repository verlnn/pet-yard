package io.pet.petyard.feed.adapter.in.web;

import io.pet.petyard.feed.application.model.HomeFeedPostView;
import io.pet.petyard.feed.application.model.HomeFeedImageView;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(description = "홈 피드 게시물 응답")
public record HomeFeedPostResponse(
    @Schema(description = "게시물 식별자", example = "101")
    Long id,
    @Schema(description = "게시물 본문", nullable = true)
    String content,
    @Schema(description = "목록 카드 대표 이미지 URL", nullable = true)
    String thumbnailImageUrl,
    @Schema(description = "하위 호환용 이미지 URL 목록")
    List<String> imageUrls,
    @Schema(description = "확장 가능한 이미지 메타 목록")
    List<HomeFeedImageResponse> images,
    @Schema(description = "대표 이미지 종횡비 값", nullable = true)
    Double imageAspectRatioValue,
    @Schema(description = "대표 이미지 종횡비 코드", nullable = true, example = "4:5")
    String imageAspectRatio,
    @Schema(description = "발자국 수", example = "22")
    long pawCount,
    @Schema(description = "현재 사용자 발자국 여부", example = "true")
    boolean pawedByMe,
    @Schema(description = "게시물 생성 시각")
    Instant createdAt,
    @Schema(description = "해시태그 목록")
    List<String> hashtags,
    @Schema(description = "작성자 식별자", example = "11")
    Long authorId,
    @Schema(description = "작성자 공개 ID", nullable = true, example = "meongnyang.owner")
    String authorUsername,
    @Schema(description = "작성자 닉네임", example = "멍냥집사")
    String authorNickname,
    @Schema(description = "작성자 프로필 이미지 URL", nullable = true)
    String authorProfileImageUrl,
    @Schema(description = "현재 사용자의 집사 관계 상태", example = "NONE")
    String guardianRelationStatus,
    @Schema(description = "현재 사용자의 집사 연결 여부", example = "false")
    boolean guardianRegisteredByMe,
    @Schema(description = "댓글 수", example = "3")
    long commentCount
) {
    public static HomeFeedPostResponse from(HomeFeedPostView post) {
        return new HomeFeedPostResponse(
            post.id(),
            post.content(),
            post.media().thumbnailImageUrl(),
            post.media().imageUrls(),
            post.media().images().stream().map(HomeFeedImageResponse::from).toList(),
            post.media().imageAspectRatioValue(),
            post.media().imageAspectRatio(),
            post.reaction().pawCount(),
            post.reaction().pawedByMe(),
            post.createdAt(),
            post.hashtags(),
            post.author().id(),
            post.author().username(),
            post.author().nickname(),
            post.author().profileImageUrl(),
            post.author().guardianRelationStatus(),
            post.author().guardianRegisteredByMe(),
            post.reaction().commentCount()
        );
    }

    @Schema(description = "홈 피드 이미지 메타 정보")
    public record HomeFeedImageResponse(
        @Schema(description = "썸네일 URL")
        String thumbnailUrl,
        @Schema(description = "중간 크기 이미지 URL")
        String mediumUrl,
        @Schema(description = "원본 이미지 URL")
        String originalUrl,
        @Schema(description = "이미지 가로 픽셀", nullable = true)
        Integer width,
        @Schema(description = "이미지 세로 픽셀", nullable = true)
        Integer height,
        @Schema(description = "종횡비 값", nullable = true)
        Double aspectRatio,
        @Schema(description = "종횡비 코드", nullable = true, example = "1:1")
        String aspectRatioCode
    ) {
        public static HomeFeedImageResponse from(HomeFeedImageView image) {
            return new HomeFeedImageResponse(
                image.thumbnailUrl(),
                image.mediumUrl(),
                image.originalUrl(),
                image.width(),
                image.height(),
                image.aspectRatio(),
                image.aspectRatioCode()
            );
        }
    }
}
