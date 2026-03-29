package io.pet.petyard.user.application.service;

import io.pet.petyard.user.application.port.in.GetPublicUserProfileUseCase;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicUserProfileService implements GetPublicUserProfileUseCase {

    private final LoadUserProfilePort loadUserProfilePort;
    private final LoadGuardianRegistrationPort loadGuardianRegistrationPort;

    public PublicUserProfileService(LoadUserProfilePort loadUserProfilePort,
                                    LoadGuardianRegistrationPort loadGuardianRegistrationPort) {
        this.loadUserProfilePort = loadUserProfilePort;
        this.loadGuardianRegistrationPort = loadGuardianRegistrationPort;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewContent(Long viewerId, Long targetUserId) {
        if (viewerId != null && viewerId.equals(targetUserId)) {
            return true;
        }
        Optional<UserProfile> profileOpt = loadUserProfilePort.findByUserId(targetUserId);
        if (profileOpt.isEmpty() || !profileOpt.get().isPrivate()) {
            return true;
        }
        if (viewerId == null) {
            return false;
        }
        List<Long> connectedIds = loadGuardianRegistrationPort.findConnectedGuardianUserIds(targetUserId);
        return connectedIds.contains(viewerId);
    }
}
