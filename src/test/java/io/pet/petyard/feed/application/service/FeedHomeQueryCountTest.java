package io.pet.petyard.feed.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import io.pet.petyard.feed.adapter.out.persistence.FeedHashtagPersistenceAdapter;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostHashtagRepository;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostImagePersistenceAdapter;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostImageRepository;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostPawPersistenceAdapter;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostPawRepository;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostPersistenceAdapter;
import io.pet.petyard.feed.adapter.out.persistence.FeedPostRepository;
import io.pet.petyard.feed.adapter.out.persistence.HashtagRepository;
import io.pet.petyard.feed.domain.model.FeedPost;
import io.pet.petyard.feed.domain.model.FeedPostHashtag;
import io.pet.petyard.feed.domain.model.FeedPostImage;
import io.pet.petyard.feed.domain.model.FeedPostPaw;
import io.pet.petyard.feed.domain.model.Hashtag;
import io.pet.petyard.user.adapter.out.persistence.UserProfilePersistenceAdapter;
import io.pet.petyard.user.adapter.out.persistence.UserProfileRepository;
import io.pet.petyard.user.domain.model.UserProfile;

import java.sql.Timestamp;
import java.time.Instant;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;

@SpringBootTest(properties = {
    "spring.jpa.properties.hibernate.generate_statistics=true"
})
@Import({
    FeedPostPersistenceAdapter.class,
    FeedPostImagePersistenceAdapter.class,
    FeedPostPawPersistenceAdapter.class,
    FeedHashtagPersistenceAdapter.class,
    UserProfilePersistenceAdapter.class,
    FeedApplicationService.class,
    FeedHomeQueryCountTest.FeedTestConfig.class
})
@Transactional
class FeedHomeQueryCountTest {

    @TestConfiguration
    static class FeedTestConfig {
        @Bean
        FeedProperties feedProperties() {
            return new FeedProperties(10, 20);
        }
    }

    @Autowired private FeedApplicationService service;
    @Autowired private FeedPostRepository feedPostRepository;
    @Autowired private FeedPostImageRepository feedPostImageRepository;
    @Autowired private FeedPostPawRepository feedPostPawRepository;
    @Autowired private HashtagRepository hashtagRepository;
    @Autowired private FeedPostHashtagRepository feedPostHashtagRepository;
    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private EntityManager entityManager;
    @Autowired private EntityManagerFactory entityManagerFactory;

    private Statistics statistics;

    @BeforeEach
    void setUp() {
        statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
    }

    @Test
    void listHomeFeedUsesSinglePageQueryPlusBatchedLookups() {
        FeedPost first = persistPost(21L, "first", Instant.parse("2026-03-23T00:03:00Z"));
        FeedPost second = persistPost(22L, "second", Instant.parse("2026-03-23T00:02:00Z"));

        feedPostImageRepository.save(new FeedPostImage(first.getId(), "/images/1.jpg", null, 1.0, "1:1", 0));
        feedPostImageRepository.save(new FeedPostImage(second.getId(), "/images/2.jpg", null, 1.0, "1:1", 0));
        feedPostPawRepository.save(new FeedPostPaw(first.getId(), 77L));
        Hashtag hashtag = hashtagRepository.save(new Hashtag("산책"));
        feedPostHashtagRepository.save(new FeedPostHashtag(first.getId(), hashtag.getId()));
        userProfileRepository.save(new UserProfile(21L, "멍이", null, "/profiles/1.jpg", false, true));
        userProfileRepository.save(new UserProfile(22L, "냥이", null, "/profiles/2.jpg", false, true));

        statistics.clear();

        var slice = service.listHomeFeed(77L, null, null, 2);

        assertThat(slice.items()).hasSize(2);
        assertThat(statistics.getPrepareStatementCount()).isEqualTo(9);
    }

    private FeedPost persistPost(Long userId, String content, Instant createdAt) {
        FeedPost saved = feedPostRepository.saveAndFlush(new FeedPost(userId, content, 1.0, "1:1"));
        jdbcTemplate.update(
            "update feed.feed_posts set created_at = ?, updated_at = ? where id = ?",
            Timestamp.from(createdAt),
            Timestamp.from(createdAt),
            saved.getId()
        );
        entityManager.clear();
        return feedPostRepository.findById(saved.getId()).orElseThrow();
    }
}
