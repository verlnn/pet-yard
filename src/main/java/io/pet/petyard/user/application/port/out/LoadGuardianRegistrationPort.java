package io.pet.petyard.user.application.port.out;

import io.pet.petyard.user.domain.model.GuardianRegistration;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LoadGuardianRegistrationPort {
    Optional<GuardianRegistration> findRelationship(Long userId, Long otherUserId);
    List<GuardianRegistration> findRelationships(Long userId, Collection<Long> otherUserIds);
    long countConnectedByUserId(Long userId);
    List<Long> findConnectedGuardianUserIds(Long userId);
}
