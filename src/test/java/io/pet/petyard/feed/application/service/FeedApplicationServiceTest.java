package io.pet.petyard.feed.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.feed.application.model.HomeFeedSlice;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.DeleteFeedPostPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostCommentPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.LoadFeedPostPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostHashtagPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostImagePort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPawPort;
import io.pet.petyard.feed.application.port.out.SaveFeedPostPort;
import io.pet.petyard.notification.application.port.out.SaveUserNotificationPort;
import io.pet.petyard.feed.domain.model.FeedPost;
import io.pet.petyard.feed.domain.model.FeedPostImage;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.pet.petyard.user.domain.GuardianRegistrationStatus;
import io.pet.petyard.user.domain.model.GuardianRegistration;
import io.pet.petyard.user.domain.model.UserProfile;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@org.junit.jupiter.api.extension.ExtendWith(MockitoExtension.class)
class FeedApplicationServiceTest {

    @Mock private LoadFeedPostPort loadFeedPostPort;
    @Mock private SaveFeedPostPort saveFeedPostPort;
    @Mock private DeleteFeedPostPort deleteFeedPostPort;
    @Mock private SaveFeedPostImagePort saveFeedPostImagePort;
    @Mock private LoadFeedPostImagePort loadFeedPostImagePort;
    @Mock private SaveFeedPostPawPort saveFeedPostPawPort;
    @Mock private LoadFeedPostPawPort loadFeedPostPawPort;
    @Mock private DeleteFeedPostPawPort deleteFeedPostPawPort;
    @Mock private SaveFeedPostHashtagPort saveFeedPostHashtagPort;
    @Mock private LoadFeedPostHashtagPort loadFeedPostHashtagPort;
    @Mock private LoadFeedPostCommentPort loadFeedPostCommentPort;
    @Mock private LoadUserProfilePort loadUserProfilePort;
    @Mock private LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    @Mock private GuardianRegistrationService guardianRegistrationService;
    @Mock private LoadUserPort loadUserPort;
    @Mock private SaveUserNotificationPort saveUserNotificationPort;

    private FeedApplicationService service;

    @BeforeEach
    void setUp() {
        service = new FeedApplicationService(
            loadFeedPostPort,
            saveFeedPostPort,
            deleteFeedPostPort,
            saveFeedPostImagePort,
            loadFeedPostImagePort,
            saveFeedPostPawPort,
            loadFeedPostPawPort,
            deleteFeedPostPawPort,
            saveFeedPostHashtagPort,
            loadFeedPostHashtagPort,
            loadFeedPostCommentPort,
            loadUserProfilePort,
            loadGuardianRegistrationPort,
            guardianRegistrationService,
            loadUserPort,
            new FeedProperties(10, 20),
            saveUserNotificationPort
        );
    }

    @ParameterizedTest
    @MethodSource("defaultLimitInputs")
    void usesConfiguredDefaultLimitWhenRequestLimitIsMissingOrInvalid(Integer requestLimit) {
        when(loadFeedPostPort.findHomeFeedPage(null, null, 11)).thenReturn(List.of());

        HomeFeedSlice result = service.listHomeFeed(11L, null, null, requestLimit);

        assertThat(result.items()).isEmpty();
        verify(loadFeedPostPort).findHomeFeedPage(null, null, 11);
    }

    @Test
    void clampsRequestedLimitToConfiguredMaximum() {
        when(loadFeedPostPort.findHomeFeedPage(null, null, 21)).thenReturn(List.of());

        service.listHomeFeed(11L, null, null, 999);

        verify(loadFeedPostPort).findHomeFeedPage(null, null, 21);
    }

    @Test
    void computesHasMoreAndNextCursorFromExtraRecord() {
        FeedPost newest = post(301L, 21L, "newest", Instant.parse("2026-03-23T00:03:00Z"));
        FeedPost middle = post(300L, 22L, "middle", Instant.parse("2026-03-23T00:02:00Z"));
        FeedPost extra = post(299L, 23L, "extra", Instant.parse("2026-03-23T00:01:00Z"));

        when(loadFeedPostPort.findHomeFeedPage(null, null, 3)).thenReturn(List.of(newest, middle, extra));
        when(loadFeedPostImagePort.findByPostIds(List.of(301L, 300L))).thenReturn(Map.of());
        when(loadFeedPostPawPort.countByPostIds(List.of(301L, 300L))).thenReturn(Map.of());
        when(loadFeedPostPawPort.findPawedPostIds(55L, List.of(301L, 300L))).thenReturn(List.of());
        when(loadFeedPostCommentPort.countByPostIds(List.of(301L, 300L))).thenReturn(Map.of());
        when(loadFeedPostHashtagPort.findTagNamesByPostIds(List.of(301L, 300L))).thenReturn(Map.of());
        when(loadUserProfilePort.findByUserIds(anyCollection())).thenReturn(List.of(
            new UserProfile(21L, "보호자1", null, null, false, true),
            new UserProfile(22L, "보호자2", null, null, false, true)
        ));
        when(loadUserPort.findByIds(anyCollection())).thenReturn(Set.of(
            user(21L, "guardian.one"),
            user(22L, "guardian.two")
        ));
        when(loadGuardianRegistrationPort.findRelationships(eq(55L), anyCollection())).thenReturn(List.of());

        HomeFeedSlice result = service.listHomeFeed(55L, null, null, 2);

        assertThat(result.items()).hasSize(2);
        assertThat(result.items().getFirst().author().username()).isEqualTo("guardian.one");
        assertThat(result.hasMore()).isTrue();
        assertThat(result.nextCursorCreatedAt()).isEqualTo(middle.getCreatedAt());
        assertThat(result.nextCursorId()).isEqualTo(middle.getId());
    }

    @Test
    void loadsRelatedDataInPageBatchesOncePerRequest() {
        FeedPost first = post(101L, 21L, "first", Instant.parse("2026-03-23T00:03:00Z"));
        FeedPost second = post(100L, 22L, "second", Instant.parse("2026-03-23T00:02:00Z"));

        when(loadFeedPostPort.findHomeFeedPage(null, null, 3)).thenReturn(List.of(first, second));
        when(loadFeedPostImagePort.findByPostIds(List.of(101L, 100L))).thenReturn(Map.of(
            101L, List.of(new FeedPostImage(101L, "/a.jpg", null, 1.0, "1:1", 0))
        ));
        when(loadFeedPostPawPort.countByPostIds(List.of(101L, 100L))).thenReturn(Map.of(101L, 3L));
        when(loadFeedPostPawPort.findPawedPostIds(77L, List.of(101L, 100L))).thenReturn(List.of(101L));
        when(loadFeedPostCommentPort.countByPostIds(List.of(101L, 100L))).thenReturn(Map.of(101L, 2L));
        when(loadFeedPostHashtagPort.findTagNamesByPostIds(List.of(101L, 100L))).thenReturn(Map.of(101L, List.of("강아지")));
        when(loadUserProfilePort.findByUserIds(anyCollection())).thenReturn(List.of(
            new UserProfile(21L, "멍이", null, "/pet-1.jpg", false, true),
            new UserProfile(22L, "냥이", null, "/pet-2.jpg", false, true)
        ));
        when(loadUserPort.findByIds(anyCollection())).thenReturn(Set.of(
            user(21L, "meong.owner"),
            user(22L, "nyang.owner")
        ));
        GuardianRegistration acceptedRelationship = relationship(21L, 77L, GuardianRegistrationStatus.ACCEPTED);
        when(loadGuardianRegistrationPort.findRelationships(eq(77L), anyCollection())).thenReturn(List.of(acceptedRelationship));
        when(guardianRegistrationService.toRelationStatus(77L, acceptedRelationship)).thenReturn(GuardianRelationStatus.CONNECTED);

        HomeFeedSlice result = service.listHomeFeed(77L, null, null, 2);

        assertThat(result.items()).hasSize(2);
        assertThat(result.items().getFirst().author().username()).isEqualTo("meong.owner");
        assertThat(result.items().getFirst().author().nickname()).isEqualTo("멍이");
        assertThat(result.items().getFirst().media().images()).hasSize(1);
        assertThat(result.items().getFirst().media().images().getFirst().thumbnailUrl()).isEqualTo("/a.jpg");
        assertThat(result.items().getFirst().media().images().getFirst().originalUrl()).isEqualTo("/a.jpg");
        assertThat(result.items().getFirst().author().guardianRegisteredByMe()).isTrue();
        assertThat(result.items().getFirst().reaction().pawCount()).isEqualTo(3);
        assertThat(result.items().getFirst().reaction().commentCount()).isEqualTo(2);
        verify(loadFeedPostImagePort, times(1)).findByPostIds(List.of(101L, 100L));
        verify(loadFeedPostPawPort, times(1)).countByPostIds(List.of(101L, 100L));
        verify(loadFeedPostPawPort, times(1)).findPawedPostIds(77L, List.of(101L, 100L));
        verify(loadFeedPostCommentPort, times(1)).countByPostIds(List.of(101L, 100L));
        verify(loadFeedPostHashtagPort, times(1)).findTagNamesByPostIds(List.of(101L, 100L));
        verify(loadUserProfilePort, times(1)).findByUserIds(anyCollection());
    }

    private static Stream<Arguments> defaultLimitInputs() {
        return Stream.of(
            Arguments.of((Integer) null),
            Arguments.of(0),
            Arguments.of(-5)
        );
    }

    private static FeedPost post(Long id, Long userId, String content, Instant createdAt) {
        FeedPost post = new FeedPost(userId, content, 1.0, "1:1");
        ReflectionTestUtils.setField(post, "id", id);
        ReflectionTestUtils.setField(post, "createdAt", createdAt);
        ReflectionTestUtils.setField(post, "updatedAt", createdAt);
        return post;
    }

    private static User user(Long id, String username) {
        User user = new User(username + "@example.com", "encoded", username, UserTier.TIER_1, AccountStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static GuardianRegistration relationship(Long guardianUserId, Long targetUserId, GuardianRegistrationStatus status) {
        GuardianRegistration relationship = new GuardianRegistration(guardianUserId, targetUserId);
        if (status == GuardianRegistrationStatus.ACCEPTED) {
            relationship.accept();
        }
        return relationship;
    }
}
