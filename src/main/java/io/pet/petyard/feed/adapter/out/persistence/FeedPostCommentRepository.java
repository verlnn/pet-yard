package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPostComment;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedPostCommentRepository extends JpaRepository<FeedPostComment, Long> {

    @Query("""
        select c
        from FeedPostComment c
        where c.postId = :postId
        order by c.createdAt asc, c.id asc
        """)
    List<FeedPostComment> findByPostIdOrderByCreatedAtAscIdAsc(@Param("postId") Long postId);

    java.util.Optional<FeedPostComment> findById(Long id);

    @Query("""
        select c.postId, count(c)
        from FeedPostComment c
        where c.postId in :postIds
        group by c.postId
        """)
    List<Object[]> countGroupedByPostIds(@Param("postIds") Collection<Long> postIds);
}
