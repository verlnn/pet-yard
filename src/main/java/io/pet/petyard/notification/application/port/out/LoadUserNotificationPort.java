package io.pet.petyard.notification.application.port.out;

import io.pet.petyard.notification.domain.model.UserNotification;
import java.util.List;
import java.util.Optional;

public interface LoadUserNotificationPort {
    List<UserNotification> findRecentByRecipientUserId(Long recipientUserId, int limit);
    Optional<UserNotification> findByIdAndRecipientUserId(Long notificationId, Long recipientUserId);
    Optional<UserNotification> findLatestPendingGuardianRequest(Long recipientUserId, Long actorUserId);
}
