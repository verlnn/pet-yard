package io.pet.petyard.user.application.service;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.user.application.port.out.DeleteGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.SaveGuardianRegistrationPort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GuardianRegistrationService {

    private final LoadUserPort loadUserPort;
    private final LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    private final SaveGuardianRegistrationPort saveGuardianRegistrationPort;
    private final DeleteGuardianRegistrationPort deleteGuardianRegistrationPort;

    public GuardianRegistrationService(LoadUserPort loadUserPort,
                                       LoadGuardianRegistrationPort loadGuardianRegistrationPort,
                                       SaveGuardianRegistrationPort saveGuardianRegistrationPort,
                                       DeleteGuardianRegistrationPort deleteGuardianRegistrationPort) {
        this.loadUserPort = loadUserPort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
        this.saveGuardianRegistrationPort = saveGuardianRegistrationPort;
        this.deleteGuardianRegistrationPort = deleteGuardianRegistrationPort;
    }

    @Transactional
    public boolean register(Long guardianUserId, Long targetUserId) {
        validateTarget(guardianUserId, targetUserId);
        if (!loadGuardianRegistrationPort.existsByGuardianUserIdAndTargetUserId(guardianUserId, targetUserId)) {
            saveGuardianRegistrationPort.save(guardianUserId, targetUserId);
        }
        return true;
    }

    @Transactional
    public boolean unregister(Long guardianUserId, Long targetUserId) {
        validateTarget(guardianUserId, targetUserId);
        deleteGuardianRegistrationPort.delete(guardianUserId, targetUserId);
        return false;
    }

    private void validateTarget(Long guardianUserId, Long targetUserId) {
        if (guardianUserId.equals(targetUserId)) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        loadUserPort.findById(targetUserId).orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
    }
}
