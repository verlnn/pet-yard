package io.pet.petyard.notification.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.notification.application.port.out.LoadUserNotificationPort;
import io.pet.petyard.notification.application.port.out.SaveUserNotificationPort;
import io.pet.petyard.notification.domain.NotificationType;
import io.pet.petyard.notification.domain.model.UserNotification;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class NotificationApplicationServiceTest {

    @Mock private LoadUserNotificationPort loadUserNotificationPort;
    @Mock private SaveUserNotificationPort saveUserNotificationPort;
    @Mock private LoadUserPort loadUserPort;
    @Mock private LoadUserProfilePort loadUserProfilePort;

    private NotificationApplicationService service;

    @BeforeEach
    void setUp() {
        service = new NotificationApplicationService(
            loadUserNotificationPort,
            saveUserNotificationPort,
            loadUserPort,
            loadUserProfilePort
        );
    }

    @Test
    @DisplayName("알림 목록 조회는 사용자와 프로필 정보를 합쳐 응답한다")
    void listNotificationsBuildsResponses() {
        UserNotification notification = new UserNotification(11L, 22L, NotificationType.GUARDIAN_REQUEST);
        ReflectionTestUtils.setField(notification, "id", 101L);
        ReflectionTestUtils.setField(notification, "createdAt", Instant.parse("2026-03-23T12:00:00Z"));
        given(loadUserNotificationPort.findRecentByRecipientUserId(11L, 30)).willReturn(List.of(notification));
        given(loadUserPort.findByIds(List.of(22L))).willReturn(Set.of(user(22L, "guardian.two")));
        given(loadUserProfilePort.findByUserIds(List.of(22L))).willReturn(List.of(new UserProfile(22L, "보리집사", null, "/profile.jpg", false, true)));

        var responses = service.listNotifications(11L);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().actorUsername()).isEqualTo("guardian.two");
        assertThat(responses.getFirst().actorNickname()).isEqualTo("보리집사");
        assertThat(responses.getFirst().actionable()).isTrue();
    }

    @Test
    @DisplayName("읽지 않은 알림 수 조회는 unread 상태만 집계한다")
    void countUnreadNotificationsReturnsUnreadCount() {
        given(loadUserNotificationPort.countUnreadByRecipientUserId(11L)).willReturn(7L);

        long unreadCount = service.countUnreadNotifications(11L);

        assertThat(unreadCount).isEqualTo(7L);
    }

    private User user(Long id, String username) {
        User user = new User(username + "@example.com", "hash", username, UserTier.TIER_1, AccountStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
