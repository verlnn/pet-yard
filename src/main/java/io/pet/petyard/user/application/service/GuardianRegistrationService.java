package io.pet.petyard.user.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
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

    public GuardianRegistrationService(LoadUserPort loadUserPort,
                                       LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                       SaveGuardianRegistrationPort saveGuardianRegistrationPort,
                                       DeleteGuardianRegistrationPort deleteGuardianRegistrationPort,
                                       GuardianRequestRateLimiter guardianRequestRateLimiter) {
        this.loadUserPort = loadUserPort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.saveGuardianRegistrationPort = saveGuardianRegistrationPort;
        this.deleteGuardianRegistrationPort = deleteGuardianRegistrationPort;
        this.guardianRequestRateLimiter = guardianRequestRateLimiter;
    }

    @Transactional
    public GuardianRelationStatus requestOrAccept(Long userId, Long targetUserId) {
        validateTarget(userId, targetUserId);

        GuardianRegistration relationship = loadGuardianRegistrationPort.findRelationship(userId, targetUserId)
            .orElse(null);
        if (relationship == null) {
            guardianRequestRateLimiter.checkAllowed(userId);
            saveGuardianRegistrationPort.save(new GuardianRegistration(userId, targetUserId));
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
        return GuardianRelationStatus.CONNECTED;
    }

    @Transactional
    public GuardianRelationStatus remove(Long userId, Long targetUserId) {
        validateTarget(userId, targetUserId);
        deleteGuardianRegistrationPort.delete(userId, targetUserId);
        return GuardianRelationStatus.NONE;
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
}
