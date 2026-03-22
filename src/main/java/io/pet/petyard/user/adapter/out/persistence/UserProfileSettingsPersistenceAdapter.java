package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.port.out.SaveUserProfileSettingsPort;
import io.pet.petyard.user.domain.model.UserProfileSettings;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class UserProfileSettingsPersistenceAdapter implements LoadUserProfileSettingsPort, SaveUserProfileSettingsPort {

    private final UserProfileSettingsRepository repository;

    public UserProfileSettingsPersistenceAdapter(UserProfileSettingsRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<UserProfileSettings> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public UserProfileSettings save(UserProfileSettings settings) {
        return repository.save(settings);
    }
}
