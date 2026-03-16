package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.SaveUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class UserProfilePersistenceAdapter implements LoadUserProfilePort, SaveUserProfilePort {

    private final UserProfileRepository repository;

    public UserProfilePersistenceAdapter(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean existsByNickname(String nickname) {
        return repository.existsByNickname(nickname);
    }

    @Override
    public Optional<UserProfile> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public UserProfile save(UserProfile profile) {
        return repository.save(profile);
    }
}
