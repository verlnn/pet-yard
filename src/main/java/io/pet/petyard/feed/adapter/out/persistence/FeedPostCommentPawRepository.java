package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPostCommentPaw;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedPostCommentPawRepository extends JpaRepository<FeedPostCommentPaw, Long> {

    @Query("""
        select p.commentId, count(p)
        from FeedPostCommentPaw p
        where p.commentId in :commentIds
        group by p.commentId
        """)
    List<Object[]> countGroupedByCommentIds(@Param("commentIds") Collection<Long> commentIds);

    @Query("""
        select p.commentId
        from FeedPostCommentPaw p
        where p.userId = :userId
          and p.commentId in :commentIds
        """)
    List<Long> findCommentIdsByUserIdAndCommentIdIn(@Param("userId") Long userId, @Param("commentIds") Collection<Long> commentIds);

    boolean existsByCommentIdAndUserId(Long commentId, Long userId);

    @Modifying
    void deleteByCommentIdAndUserId(Long commentId, Long userId);
}
