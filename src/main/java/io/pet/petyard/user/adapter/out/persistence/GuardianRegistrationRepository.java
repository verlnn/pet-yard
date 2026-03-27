package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.domain.model.GuardianRegistration;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuardianRegistrationRepository extends JpaRepository<GuardianRegistration, Long> {
    @Query("""
        select g
        from GuardianRegistration g
        where (g.guardianUserId = :userId and g.targetUserId = :otherUserId)
           or (g.guardianUserId = :otherUserId and g.targetUserId = :userId)
        """)
    Optional<GuardianRegistration> findRelationship(
        @Param("userId") Long userId,
        @Param("otherUserId") Long otherUserId
    );

    @Query("""
        select g
        from GuardianRegistration g
        where (g.guardianUserId = :userId and g.targetUserId in :otherUserIds)
           or (g.targetUserId = :userId and g.guardianUserId in :otherUserIds)
        """)
    List<GuardianRegistration> findRelationships(
        @Param("userId") Long userId,
        @Param("otherUserIds") Collection<Long> otherUserIds
    );

    @Query("""
        select count(g)
        from GuardianRegistration g
        where g.status = io.pet.petyard.user.domain.GuardianRegistrationStatus.ACCEPTED
          and (g.guardianUserId = :userId or g.targetUserId = :userId)
        """)
    long countConnectedByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("""
        delete from GuardianRegistration g
        where (g.guardianUserId = :userId and g.targetUserId = :otherUserId)
           or (g.guardianUserId = :otherUserId and g.targetUserId = :userId)
        """)
    void deleteRelationship(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    @Query("""
        select g.guardianUserId
        from GuardianRegistration g
        where g.targetUserId = :targetUserId
          and g.status = io.pet.petyard.user.domain.GuardianRegistrationStatus.ACCEPTED
        order by g.respondedAt desc
        """)
    List<Long> findAcceptedGuardiansByTargetUserId(@Param("targetUserId") Long targetUserId);
}
