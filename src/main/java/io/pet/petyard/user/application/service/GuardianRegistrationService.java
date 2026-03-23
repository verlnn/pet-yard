package io.pet.petyard.user.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.notification.application.port.out.LoadUserNotificationPort;
import io.pet.petyard.notification.application.port.out.SaveUserNotificationPort;
import io.pet.petyard.notification.domain.model.UserNotification;
import io.pet.petyard.notification.domain.NotificationType;
import io.pet.petyard.user.application.port.out.DeleteGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.SaveGuardianRegistrationPort;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.pet.petyard.user.domain.model.GuardianRegistration;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuardianRegistrationService {

    private final LoadUserPort loadUserPort;
    private final LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    private final SaveGuardianRegistrationPort saveGuardianRegistrationPort;
    private final DeleteGuardianRegistrationPort deleteGuardianRegistrationPort;
    private final GuardianRequestRateLimiter guardianRequestRateLimiter;
    private final LoadUserNotificationPort loadUserNotificationPort;
    private final SaveUserNotificationPort saveUserNotificationPort;

    public GuardianRegistrationService(LoadUserPort loadUserPort,
                                       LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                       SaveGuardianRegistrationPort saveGuardianRegistrationPort,
                                       DeleteGuardianRegistrationPort deleteGuardianRegistrationPort,
                                       GuardianRequestRateLimiter guardianRequestRateLimiter,
                                       LoadUserNotificationPort loadUserNotificationPort,
                                       SaveUserNotificationPort saveUserNotificationPort) {
        this.loadUserPort = loadUserPort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.saveGuardianRegistrationPort = saveGuardianRegistrationPort;
        this.deleteGuardianRegistrationPort = deleteGuardianRegistrationPort;
        this.guardianRequestRateLimiter = guardianRequestRateLimiter;
        this.loadUserNotificationPort = loadUserNotificationPort;
        this.saveUserNotificationPort = saveUserNotificationPort;
    }

    @Transactional
    public GuardianRelationStatus requestOrAccept(Long userId, Long targetUserId) {
        validateTarget(userId, targetUserId);

        GuardianRegistration relationship = loadGuardianRegistrationPort.findRelationship(userId, targetUserId)
            .orElse(null);
        if (relationship == null) {
            guardianRequestRateLimiter.checkAllowed(userId);
            saveGuardianRegistrationPort.save(new GuardianRegistration(userId, targetUserId));
            saveUserNotificationPort.save(new UserNotification(targetUserId, userId, NotificationType.GUARDIAN_REQUEST));
            return GuardianRelationStatus.OUTGOING_REQUESTED;
        }

        if (relationship.isAccepted()) {
            return GuardianRelationStatus.CONNECTED;
        }

        if (relationship.isRequestedBy(userId)) {
            return GuardianRelationStatus.OUTGOING_REQUESTED;
        }

        relationship.accept();
        saveGuardianRegistrationPort.save(relationship);
        markGuardianRequestNotificationAccepted(relationship.getGuardianUserId(), relationship.getTargetUserId());
        saveUserNotificationPort.save(new UserNotification(relationship.getGuardianUserId(), userId, NotificationType.GUARDIAN_REQUEST_ACCEPTED));
        return GuardianRelationStatus.CONNECTED;
    }

    @Transactional
    public GuardianRelationStatus remove(Long userId, Long targetUserId) {
        validateTarget(userId, targetUserId);
        GuardianRegistration relationship = loadGuardianRegistrationPort.findRelationship(userId, targetUserId).orElse(null);
        if (relationship != null && !relationship.isAccepted()) {
            markGuardianRequestNotificationRemoved(relationship, userId);
        }
        deleteGuardianRegistrationPort.delete(userId, targetUserId);
        return GuardianRelationStatus.NONE;
    }

    @Transactional
    public GuardianRelationStatus acceptFromNotification(Long userId, Long notificationId) {
        UserNotification notification = loadUserNotificationPort.findByIdAndRecipientUserId(notificationId, userId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        if (!notification.isActionableGuardianRequest()) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        return requestOrAccept(userId, notification.getActorUserId());
    }

    @Transactional
    public GuardianRelationStatus rejectFromNotification(Long userId, Long notificationId) {
        UserNotification notification = loadUserNotificationPort.findByIdAndRecipientUserId(notificationId, userId)
            .orElseThrow(() -> new ApiException(ErrorCode.BAD_REQUEST));
        if (!notification.isActionableGuardianRequest()) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        return remove(userId, notification.getActorUserId());
    }

    @Transactional(readOnly = true)
    public GuardianRelationStatus getRelationStatus(Long userId, Long targetUserId) {
        if (userId == null || userId.equals(targetUserId)) {
            return GuardianRelationStatus.NONE;
        }
        return loadGuardianRegistrationPort.findRelationship(userId, targetUserId)
            .map(relationship -> toRelationStatus(userId, relationship))
            .orElse(GuardianRelationStatus.NONE);
    }

    public GuardianRelationStatus toRelationStatus(Long userId, GuardianRegistration relationship) {
        if (relationship.isAccepted()) {
            return GuardianRelationStatus.CONNECTED;
        }
        if (relationship.isRequestedBy(userId)) {
            return GuardianRelationStatus.OUTGOING_REQUESTED;
        }
        if (relationship.isRequestedFor(userId)) {
            return GuardianRelationStatus.INCOMING_REQUESTED;
        }
        return GuardianRelationStatus.NONE;
    }

    private void validateTarget(Long guardianUserId, Long targetUserId) {
        if (guardianUserId.equals(targetUserId)) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        loadUserPort.findById(targetUserId).orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }

    private void markGuardianRequestNotificationAccepted(Long requesterUserId, Long recipientUserId) {
        loadUserNotificationPort.findLatestPendingGuardianRequest(recipientUserId, requesterUserId)
            .ifPresent(notification -> {
                notification.markAccepted();
                saveUserNotificationPort.save(notification);
            });
    }

    private void markGuardianRequestNotificationRemoved(GuardianRegistration relationship, Long actingUserId) {
        loadUserNotificationPort.findLatestPendingGuardianRequest(relationship.getTargetUserId(), relationship.getGuardianUserId())
            .ifPresent(notification -> {
                if (relationship.isRequestedBy(actingUserId)) {
                    notification.markCanceled();
                } else {
                    notification.markRejected();
                }
                saveUserNotificationPort.save(notification);
            });
    }
}
