package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.application.port.out.DeleteGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.SaveGuardianRegistrationPort;
import io.pet.petyard.user.domain.model.GuardianRegistration;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class GuardianRegistrationPersistenceAdapter
    implements LoadGuardianRegistrationPort, SaveGuardianRegistrationPort, DeleteGuardianRegistrationPort {

    private final GuardianRegistrationRepository repository;

    public GuardianRegistrationPersistenceAdapter(GuardianRegistrationRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<GuardianRegistration> findRelationship(Long userId, Long otherUserId) {
        return repository.findRelationship(userId, otherUserId);
    }

    @Override
    public List<GuardianRegistration> findRelationships(Long userId, Collection<Long> otherUserIds) {
        return repository.findRelationships(userId, otherUserIds);
    }

    @Override
    public long countConnectedByUserId(Long userId) {
        return repository.countConnectedByUserId(userId);
    }

    @Override
    public List<Long> findConnectedGuardianUserIds(Long userId) {
        return repository.findConnectedGuardianUserIds(userId);
    }

    @Override
    public GuardianRegistration save(GuardianRegistration guardianRegistration) {
        return repository.save(guardianRegistration);
    }

    @Override
    public void delete(Long userId, Long otherUserId) {
        repository.deleteRelationship(userId, otherUserId);
    }
}
