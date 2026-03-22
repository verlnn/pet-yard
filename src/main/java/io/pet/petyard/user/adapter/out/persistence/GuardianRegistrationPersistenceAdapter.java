package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.application.port.out.DeleteGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.SaveGuardianRegistrationPort;
import io.pet.petyard.user.domain.model.GuardianRegistration;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class GuardianRegistrationPersistenceAdapter
    implements LoadGuardianRegistrationPort, SaveGuardianRegistrationPort, DeleteGuardianRegistrationPort {

    private final GuardianRegistrationRepository repository;

    public GuardianRegistrationPersistenceAdapter(GuardianRegistrationRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean existsByGuardianUserIdAndTargetUserId(Long guardianUserId, Long targetUserId) {
        return repository.existsByGuardianUserIdAndTargetUserId(guardianUserId, targetUserId);
    }

    @Override
    public List<Long> findRegisteredTargetUserIds(Long guardianUserId, Collection<Long> targetUserIds) {
        return repository.findTargetUserIdsByGuardianUserIdAndTargetUserIdIn(guardianUserId, targetUserIds);
    }

    @Override
    public void save(Long guardianUserId, Long targetUserId) {
        repository.save(new GuardianRegistration(guardianUserId, targetUserId));
    }

    @Override
    public void delete(Long guardianUserId, Long targetUserId) {
        repository.deleteByGuardianUserIdAndTargetUserId(guardianUserId, targetUserId);
    }
}
