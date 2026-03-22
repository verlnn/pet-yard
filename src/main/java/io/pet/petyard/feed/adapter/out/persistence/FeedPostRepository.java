package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPost;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {
    List<FeedPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    // First page and cursor page stay split because PostgreSQL cannot infer the null cursor type
    // reliably in a single JPQL branch like (:cursorCreatedAt is null) or ...
    @Query("""
        select p
        from FeedPost p
        order by p.createdAt desc, p.id desc
        """)
    List<FeedPost> findHomeFeedFirstPage(Pageable pageable);

    @Query("""
        select p
        from FeedPost p
        where (p.createdAt < :cursorCreatedAt)
           or (p.createdAt = :cursorCreatedAt and p.id < :cursorId)
        order by p.createdAt desc, p.id desc
        """)
    List<FeedPost> findHomeFeedPageAfterCursor(
        @Param("cursorCreatedAt") Instant cursorCreatedAt,
        @Param("cursorId") Long cursorId,
        Pageable pageable
    );

    Optional<FeedPost> findByIdAndUserId(Long id, Long userId);
}
