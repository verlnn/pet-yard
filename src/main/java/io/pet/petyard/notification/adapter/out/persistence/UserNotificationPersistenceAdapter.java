package io.pet.petyard.notification.adapter.out.persistence;

import io.pet.petyard.notification.application.port.out.LoadUserNotificationPort;
import io.pet.petyard.notification.application.port.out.SaveUserNotificationPort;
import io.pet.petyard.notification.domain.NotificationStatus;
import io.pet.petyard.notification.domain.model.UserNotification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class UserNotificationPersistenceAdapter implements LoadUserNotificationPort, SaveUserNotificationPort {

    private final UserNotificationRepository repository;

    public UserNotificationPersistenceAdapter(UserNotificationRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<UserNotification> findRecentByRecipientUserId(Long recipientUserId, int limit) {
        return repository.findRecentByRecipientUserId(recipientUserId, PageRequest.of(0, limit));
    }

    @Override
    public Optional<UserNotification> findByIdAndRecipientUserId(Long notificationId, Long recipientUserId) {
        return repository.findByIdAndRecipientUserId(notificationId, recipientUserId);
    }

    @Override
    public Optional<UserNotification> findLatestPendingGuardianRequest(Long recipientUserId, Long actorUserId) {
        return repository.findPendingGuardianRequests(
            recipientUserId,
            actorUserId,
            List.of(NotificationStatus.UNREAD, NotificationStatus.READ),
            PageRequest.of(0, 1)
        ).stream().findFirst();
    }

    @Override
    public UserNotification save(UserNotification notification) {
        return repository.save(notification);
    }
}
