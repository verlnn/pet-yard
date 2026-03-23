package io.pet.petyard.user.application.port.out;

import java.util.Collection;
import java.util.List;

public interface LoadGuardianRegistrationPort {
    boolean existsByGuardianUserIdAndTargetUserId(Long guardianUserId, Long targetUserId);
    List<Long> findRegisteredTargetUserIds(Long guardianUserId, Collection<Long> targetUserIds);
    long countByTargetUserId(Long targetUserId);
}
