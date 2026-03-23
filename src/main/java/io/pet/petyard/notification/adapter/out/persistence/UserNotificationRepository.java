package io.pet.petyard.notification.adapter.out.persistence;

import io.pet.petyard.notification.domain.NotificationStatus;
import io.pet.petyard.notification.domain.NotificationType;
import io.pet.petyard.notification.domain.model.UserNotification;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    @Query("""
        select n
        from UserNotification n
        where n.recipientUserId = :recipientUserId
          and n.status <> io.pet.petyard.notification.domain.NotificationStatus.CANCELED
        order by n.createdAt desc, n.id desc
        """)
    List<UserNotification> findRecentByRecipientUserId(@Param("recipientUserId") Long recipientUserId, Pageable pageable);

    Optional<UserNotification> findByIdAndRecipientUserId(Long id, Long recipientUserId);

    @Query("""
        select n
        from UserNotification n
        where n.recipientUserId = :recipientUserId
          and n.actorUserId = :actorUserId
          and n.type = io.pet.petyard.notification.domain.NotificationType.GUARDIAN_REQUEST
          and n.status in :statuses
        order by n.createdAt desc, n.id desc
        """)
    List<UserNotification> findPendingGuardianRequests(
        @Param("recipientUserId") Long recipientUserId,
        @Param("actorUserId") Long actorUserId,
        @Param("statuses") Collection<NotificationStatus> statuses,
        Pageable pageable
    );
}
