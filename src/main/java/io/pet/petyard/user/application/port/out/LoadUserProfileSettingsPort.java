package io.pet.petyard.user.application.port.out;

import io.pet.petyard.user.domain.model.UserProfileSettings;

import java.util.Optional;

public interface LoadUserProfileSettingsPort {
    Optional<UserProfileSettings> findByUserId(Long userId);
}
