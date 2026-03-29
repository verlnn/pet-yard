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

    // ──────────────────────────────────────────────────────────────────────────
    // 기본 페이징 정렬 검증 (프라이버시 필터 포함)
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void findHomeFeedFirstPageWithPrivacyReturnsLatestPublicPostsInOrder() {
        Instant sharedCreatedAt = Instant.parse("2026-03-23T00:00:00Z");
        FeedPost oldest = persistPost(1L, "oldest", Instant.parse("2026-03-22T23:59:00Z"));
        FeedPost middleLowId = persistPost(1L, "middle-1", sharedCreatedAt);
        FeedPost middleHighId = persistPost(1L, "middle-2", sharedCreatedAt);
        FeedPost newest = persistPost(1L, "newest", Instant.parse("2026-03-23T00:01:00Z"));
        persistPublicProfile(1L);

        List<FeedPost> page = repository.findHomeFeedFirstPageWithPrivacy(1L, PageRequest.of(0, 4));

        assertThat(page).extracting(FeedPost::getId)
            .containsExactly(newest.getId(), middleHighId.getId(), middleLowId.getId(), oldest.getId());
    }

    @Test
    void findHomeFeedPageAfterCursorWithPrivacyDoesNotDuplicateOrSkipPosts() {
        Instant sharedCreatedAt = Instant.parse("2026-03-23T00:00:00Z");
        FeedPost oldest = persistPost(1L, "oldest", Instant.parse("2026-03-22T23:58:00Z"));
        FeedPost sameTimeLowId = persistPost(1L, "same-1", sharedCreatedAt);
        FeedPost sameTimeMidId = persistPost(1L, "same-2", sharedCreatedAt);
        FeedPost sameTimeHighId = persistPost(1L, "same-3", sharedCreatedAt);
        FeedPost newest = persistPost(1L, "newest", Instant.parse("2026-03-23T00:02:00Z"));
        persistPublicProfile(1L);

        List<FeedPost> firstPage = repository.findHomeFeedFirstPageWithPrivacy(1L, PageRequest.of(0, 2));
        FeedPost cursor = firstPage.getLast();

        List<FeedPost> secondPage = repository.findHomeFeedPageAfterCursorWithPrivacy(
            1L,
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

    // ──────────────────────────────────────────────────────────────────────────
    // 프라이버시 필터링 검증
    // ──────────────────────────────────────────────────────────────────────────

    @Test
    void privateProfilePostIsHiddenFromNonGuardianViewer() {
        // authorId=10: 비공개 계정, viewerId=99: 비집사
        FeedPost privatePost = persistPost(10L, "private content", Instant.parse("2026-03-23T00:00:00Z"));
        persistPrivateProfile(10L);

        List<FeedPost> page = repository.findHomeFeedFirstPageWithPrivacy(99L, PageRequest.of(0, 10));

        assertThat(page).extracting(FeedPost::getId).doesNotContain(privatePost.getId());
    }

    @Test
    void privateProfilePostIsVisibleToAcceptedGuardian() {
        // authorId=10: 비공개 계정, viewerId=31: ACCEPTED 집사
        FeedPost privatePost = persistPost(10L, "private content", Instant.parse("2026-03-23T00:00:00Z"));
        persistPrivateProfile(10L);
        persistAcceptedGuardian(31L, 10L);

        List<FeedPost> page = repository.findHomeFeedFirstPageWithPrivacy(31L, PageRequest.of(0, 10));

        assertThat(page).extracting(FeedPost::getId).contains(privatePost.getId());
    }

    @Test
    void ownPostIsAlwaysVisibleToAuthorEvenIfProfileIsPrivate() {
        FeedPost ownPost = persistPost(10L, "my content", Instant.parse("2026-03-23T00:00:00Z"));
        persistPrivateProfile(10L);

        List<FeedPost> page = repository.findHomeFeedFirstPageWithPrivacy(10L, PageRequest.of(0, 10));

        assertThat(page).extracting(FeedPost::getId).contains(ownPost.getId());
    }

    @Test
    void publicProfilePostIsVisibleToAnyViewer() {
        FeedPost publicPost = persistPost(20L, "public content", Instant.parse("2026-03-23T00:00:00Z"));
        persistPublicProfile(20L);

        List<FeedPost> page = repository.findHomeFeedFirstPageWithPrivacy(99L, PageRequest.of(0, 10));

        assertThat(page).extracting(FeedPost::getId).contains(publicPost.getId());
    }

    @Test
    void pendingGuardianCannotSeePrivateProfilePosts() {
        // authorId=10: 비공개, viewerId=50: REQUESTED(PENDING) 상태 — 빈 리스트여야 함
        FeedPost privatePost = persistPost(10L, "private content", Instant.parse("2026-03-23T00:00:00Z"));
        persistPrivateProfile(10L);
        persistRequestedGuardian(50L, 10L);

        List<FeedPost> page = repository.findHomeFeedFirstPageWithPrivacy(50L, PageRequest.of(0, 10));

        assertThat(page).extracting(FeedPost::getId).doesNotContain(privatePost.getId());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 헬퍼 메서드
    // ──────────────────────────────────────────────────────────────────────────

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

    // H2에서는 Hibernate DDL이 JPA FK 어노테이션 기반으로 테이블을 생성하므로
    // user_profiles.user_id → users.id FK 제약이 없음. 직접 삽입 가능.
    private void persistPublicProfile(Long userId) {
        jdbcTemplate.update(
            "insert into auth.user_profiles (user_id, nickname, marketing_opt_in, has_pet, is_private, created_at, updated_at) values (?, ?, false, false, false, now(), now())",
            userId, "user-" + userId
        );
        entityManager.clear();
    }

    private void persistPrivateProfile(Long userId) {
        jdbcTemplate.update(
            "insert into auth.user_profiles (user_id, nickname, marketing_opt_in, has_pet, is_private, created_at, updated_at) values (?, ?, false, false, true, now(), now())",
            userId, "user-" + userId
        );
        entityManager.clear();
    }

    private void persistAcceptedGuardian(Long guardianUserId, Long targetUserId) {
        jdbcTemplate.update(
            "insert into auth.guardian_registrations (guardian_user_id, target_user_id, status, created_at) values (?, ?, 'ACCEPTED', now())",
            guardianUserId, targetUserId
        );
        entityManager.clear();
    }

    private void persistRequestedGuardian(Long guardianUserId, Long targetUserId) {
        jdbcTemplate.update(
            "insert into auth.guardian_registrations (guardian_user_id, target_user_id, status, created_at) values (?, ?, 'REQUESTED', now())",
            guardianUserId, targetUserId
        );
        entityManager.clear();
    }
}
