package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.SaveUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;

import java.util.Collection;
import java.util.List;
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
    public List<UserProfile> findByUserIds(Collection<Long> userIds) {
        return repository.findByUserIdIn(userIds);
    }

    @Override
    public UserProfile save(UserProfile profile) {
        return repository.save(profile);
    }
}
