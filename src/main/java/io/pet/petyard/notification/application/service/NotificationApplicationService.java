package io.pet.petyard.notification.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.notification.adapter.in.web.UserNotificationResponse;
import io.pet.petyard.notification.application.port.out.LoadUserNotificationPort;
import io.pet.petyard.notification.application.port.out.SaveUserNotificationPort;
import io.pet.petyard.notification.domain.NotificationStatus;
import io.pet.petyard.notification.domain.NotificationType;
import io.pet.petyard.notification.domain.model.UserNotification;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationApplicationService {

    private static final int DEFAULT_NOTIFICATION_LIMIT = 30;

    private final LoadUserNotificationPort loadUserNotificationPort;
    private final SaveUserNotificationPort saveUserNotificationPort;
    private final LoadUserPort loadUserPort;
    private final LoadUserProfilePort loadUserProfilePort;

    public NotificationApplicationService(LoadUserNotificationPort loadUserNotificationPort,
                                          SaveUserNotificationPort saveUserNotificationPort,
                                          LoadUserPort loadUserPort,
                                          LoadUserProfilePort loadUserProfilePort) {
        this.loadUserNotificationPort = loadUserNotificationPort;
        this.saveUserNotificationPort = saveUserNotificationPort;
        this.loadUserPort = loadUserPort;
        this.loadUserProfilePort = loadUserProfilePort;
    }

    @Transactional(readOnly = true)
    public List<UserNotificationResponse> listNotifications(Long userId) {
        List<UserNotification> notifications = loadUserNotificationPort.findRecentByRecipientUserId(userId, DEFAULT_NOTIFICATION_LIMIT);
        List<Long> actorIds = notifications.stream().map(UserNotification::getActorUserId).distinct().toList();

        Map<Long, User> usersById = loadUserPort.findByIds(actorIds).stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, UserProfile> profilesByUserId = loadUserProfilePort.findByUserIds(actorIds).stream()
            .collect(Collectors.toMap(UserProfile::getUserId, Function.identity()));

        return notifications.stream()
            .map(notification -> toResponse(notification, usersById.get(notification.getActorUserId()), profilesByUserId.get(notification.getActorUserId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public long countUnreadNotifications(Long userId) {
        return loadUserNotificationPort.countUnreadByRecipientUserId(userId);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        UserNotification notification = loadUserNotificationPort.findByIdAndRecipientUserId(notificationId, userId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        notification.markRead();
        saveUserNotificationPort.save(notification);
    }

    private UserNotificationResponse toResponse(UserNotification notification, User actor, UserProfile profile) {
        String actorUsername = actor == null ? null : actor.getUsername();
        String actorNickname = profile == null ? actorUsername == null ? "알 수 없는 사용자" : actorUsername : profile.getNickname();
        String actorProfileImageUrl = profile == null ? null : profile.getProfileImageUrl();
        return new UserNotificationResponse(
            notification.getId(),
            notification.getType().name(),
            notification.getStatus().name(),
            notification.getActorUserId(),
            actorUsername,
            actorNickname,
            actorProfileImageUrl,
            messageOf(notification.getType(), notification.getStatus(), actorNickname),
            notification.getCreatedAt(),
            notification.isActionableGuardianRequest(),
            notification.isActionableGuardianRequest() ? "수락" : null,
            notification.isActionableGuardianRequest() ? "거절" : null
        );
    }

    private String messageOf(NotificationType type, NotificationStatus status, String actorNickname) {
        if (type == NotificationType.GUARDIAN_REQUEST_ACCEPTED) {
            return actorNickname + "님이 집사 요청을 수락했어요";
        }
        if (status == NotificationStatus.ACCEPTED) {
            return actorNickname + "님과 집사 관계가 연결되었어요";
        }
        if (status == NotificationStatus.REJECTED) {
            return actorNickname + "님의 집사 요청을 거절했어요";
        }
        return actorNickname + "님이 집사 요청을 보냈어요";
    }
}
