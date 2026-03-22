package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPostPaw;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedPostPawRepository extends JpaRepository<FeedPostPaw, Long> {
    @Query("""
        select p.postId, count(p)
        from FeedPostPaw p
        where p.postId in :postIds
        group by p.postId
        """)
    List<Object[]> countGroupedByPostIds(@Param("postIds") Collection<Long> postIds);

    @Query("""
        select p.postId
        from FeedPostPaw p
        where p.userId = :userId
          and p.postId in :postIds
        """)
    List<Long> findPostIdsByUserIdAndPostIdIn(@Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    @Modifying
    void deleteByPostIdAndUserId(Long postId, Long userId);
}
