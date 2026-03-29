package io.pet.petyard.user.application.service;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.user.application.port.in.UpdateAccountPrivacyUseCase;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.SaveUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountPrivacyService implements UpdateAccountPrivacyUseCase {

    private final LoadUserProfilePort loadUserProfilePort;
    private final SaveUserProfilePort saveUserProfilePort;

    public AccountPrivacyService(LoadUserProfilePort loadUserProfilePort,
                                 SaveUserProfilePort saveUserProfilePort) {
        this.loadUserProfilePort = loadUserProfilePort;
        this.saveUserProfilePort = saveUserProfilePort;
    }

    @Override
    @Transactional
    public void updatePrivacy(Long userId, boolean isPrivate) {
        UserProfile profile = loadUserProfilePort.findByUserId(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        profile.updatePrivacy(isPrivate);
        saveUserProfilePort.save(profile);
    }
}
