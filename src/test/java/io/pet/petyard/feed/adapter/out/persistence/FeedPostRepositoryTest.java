package io.pet.petyard.feed.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import io.pet.petyard.feed.domain.model.FeedPost;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class FeedPostRepositoryTest {

    @Autowired
    private FeedPostRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void findHomeFeedFirstPageReturnsLatestPostsInStableCreatedAtAndIdOrder() {
        Instant sharedCreatedAt = Instant.parse("2026-03-23T00:00:00Z");
        FeedPost oldest = persistPost(1L, "oldest", Instant.parse("2026-03-22T23:59:00Z"));
        FeedPost middleLowId = persistPost(1L, "middle-1", sharedCreatedAt);
        FeedPost middleHighId = persistPost(1L, "middle-2", sharedCreatedAt);
        FeedPost newest = persistPost(1L, "newest", Instant.parse("2026-03-23T00:01:00Z"));

        List<FeedPost> page = repository.findHomeFeedFirstPage(PageRequest.of(0, 4));

        assertThat(page).extracting(FeedPost::getId)
            .containsExactly(newest.getId(), middleHighId.getId(), middleLowId.getId(), oldest.getId());
    }

    @Test
    void findHomeFeedPageAfterCursorDoesNotDuplicateOrSkipPostsWhenCreatedAtMatches() {
        Instant sharedCreatedAt = Instant.parse("2026-03-23T00:00:00Z");
        FeedPost oldest = persistPost(1L, "oldest", Instant.parse("2026-03-22T23:58:00Z"));
        FeedPost sameTimeLowId = persistPost(1L, "same-1", sharedCreatedAt);
        FeedPost sameTimeMidId = persistPost(1L, "same-2", sharedCreatedAt);
        FeedPost sameTimeHighId = persistPost(1L, "same-3", sharedCreatedAt);
        FeedPost newest = persistPost(1L, "newest", Instant.parse("2026-03-23T00:02:00Z"));

        List<FeedPost> firstPage = repository.findHomeFeedFirstPage(PageRequest.of(0, 2));
        FeedPost cursor = firstPage.getLast();

        List<FeedPost> secondPage = repository.findHomeFeedPageAfterCursor(
            cursor.getCreatedAt(),
            cursor.getId(),
            PageRequest.of(0, 3)
        );

        assertThat(firstPage).extracting(FeedPost::getId)
            .containsExactly(newest.getId(), sameTimeHighId.getId());
        assertThat(secondPage).extracting(FeedPost::getId)
            .containsExactly(sameTimeMidId.getId(), sameTimeLowId.getId(), oldest.getId());

        assertThat(firstPage).extracting(FeedPost::getId)
            .doesNotContainAnyElementsOf(secondPage.stream().map(FeedPost::getId).toList());
    }

    private FeedPost persistPost(Long userId, String content, Instant createdAt) {
        FeedPost saved = repository.saveAndFlush(new FeedPost(userId, content, 1.0, "1:1"));
        jdbcTemplate.update(
            "update feed.feed_posts set created_at = ?, updated_at = ? where id = ?",
            Timestamp.from(createdAt),
            Timestamp.from(createdAt),
            saved.getId()
        );
        entityManager.clear();
        return repository.findById(saved.getId()).orElseThrow();
    }
}
