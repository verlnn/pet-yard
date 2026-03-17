package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPost;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {
    List<FeedPost> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<FeedPost> findByIdAndUserId(Long id, Long userId);
}
