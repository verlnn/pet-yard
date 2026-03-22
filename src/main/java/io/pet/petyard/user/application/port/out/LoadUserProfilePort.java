package io.pet.petyard.user.application.port.out;

import io.pet.petyard.user.domain.model.UserProfile;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LoadUserProfilePort {
    boolean existsByNickname(String nickname);
    Optional<UserProfile> findByUserId(Long userId);
    List<UserProfile> findByUserIds(Collection<Long> userIds);
}
