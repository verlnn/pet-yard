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
@Table(name = "feed_post_paws", schema = "feed")
public class FeedPostPaw {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long postId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected FeedPostPaw() {
    }

    public FeedPostPaw(Long postId, Long userId) {
        this.postId = postId;
        this.userId = userId;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
