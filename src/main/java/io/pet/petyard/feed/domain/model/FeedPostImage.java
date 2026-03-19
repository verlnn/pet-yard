package io.pet.petyard.feed.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "feed_post_images", schema = "feed")
public class FeedPostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(name = "image_url", nullable = false, columnDefinition = "text")
    private String imageUrl;

    @Column(name = "image_aspect_ratio_value")
    private Double imageAspectRatioValue;

    @Column(name = "image_aspect_ratio", length = 10)
    private String imageAspectRatio;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected FeedPostImage() {
    }

    public FeedPostImage(Long postId,
                         String imageUrl,
                         Double imageAspectRatioValue,
                         String imageAspectRatio,
                         Integer sortOrder) {
        this.postId = postId;
        this.imageUrl = imageUrl;
        this.imageAspectRatioValue = imageAspectRatioValue;
        this.imageAspectRatio = imageAspectRatio;
        this.sortOrder = sortOrder;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getPostId() {
        return postId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Double getImageAspectRatioValue() {
        return imageAspectRatioValue;
    }

    public String getImageAspectRatio() {
        return imageAspectRatio;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }
}
