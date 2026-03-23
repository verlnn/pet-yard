package io.pet.petyard.notification.application.port.out;

import io.pet.petyard.notification.domain.model.UserNotification;

public interface SaveUserNotificationPort {
    UserNotification save(UserNotification notification);
}
