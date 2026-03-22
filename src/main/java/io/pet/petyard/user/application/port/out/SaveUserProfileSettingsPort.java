package io.pet.petyard.user.application.port.out;

import io.pet.petyard.user.domain.model.UserProfileSettings;

public interface SaveUserProfileSettingsPort {
    UserProfileSettings save(UserProfileSettings settings);
}
