package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.domain.model.GuardianRegistration;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuardianRegistrationRepository extends JpaRepository<GuardianRegistration, Long> {
    boolean existsByGuardianUserIdAndTargetUserId(Long guardianUserId, Long targetUserId);
    long countByTargetUserId(Long targetUserId);

    @Query("""
        select g.targetUserId
        from GuardianRegistration g
        where g.guardianUserId = :guardianUserId
          and g.targetUserId in :targetUserIds
        """)
    List<Long> findTargetUserIdsByGuardianUserIdAndTargetUserIdIn(
        @Param("guardianUserId") Long guardianUserId,
        @Param("targetUserIds") Collection<Long> targetUserIds
    );

    @Modifying
    void deleteByGuardianUserIdAndTargetUserId(Long guardianUserId, Long targetUserId);
}
