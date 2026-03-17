package io.pet.petyard.feed.adapter.out.persistence;

import io.pet.petyard.feed.domain.model.FeedPostHashtag;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedPostHashtagRepository extends JpaRepository<FeedPostHashtag, Long> {

    interface PostTagRow {
        Long getPostId();
        String getName();
    }

    @Query("select f.postId as postId, h.name as name "
        + "from FeedPostHashtag f join Hashtag h on f.hashtagId = h.id "
        + "where f.postId in :postIds")
    List<PostTagRow> findNamesByPostIds(@Param("postIds") Collection<Long> postIds);
}
