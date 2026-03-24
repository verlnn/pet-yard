package io.pet.petyard.onboarding.application.service;

import io.pet.petyard.auth.adapter.out.persistence.AuthIdentityRepository;
import io.pet.petyard.auth.adapter.out.persistence.UserRepository;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.onboarding.adapter.out.persistence.SignupSessionRepository;
import io.pet.petyard.onboarding.domain.SignupStatus;
import io.pet.petyard.onboarding.domain.model.SignupSession;
import io.pet.petyard.pet.adapter.out.persistence.PetProfileRepository;
import io.pet.petyard.terms.adapter.out.persistence.TermsAgreementRepository;
import io.pet.petyard.user.adapter.out.persistence.UserProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(prefix = "onboarding.session", name = "cleanup-enabled", matchIfMissing = true)
public class OnboardingSessionCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(OnboardingSessionCleanupScheduler.class);

    private final SignupSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final AuthIdentityRepository authIdentityRepository;
    private final UserProfileRepository userProfileRepository;
    private final TermsAgreementRepository termsAgreementRepository;
    private final PetProfileRepository petProfileRepository;

    public OnboardingSessionCleanupScheduler(SignupSessionRepository sessionRepository,
                                             UserRepository userRepository,
                                             AuthIdentityRepository authIdentityRepository,
                                             UserProfileRepository userProfileRepository,
                                             TermsAgreementRepository termsAgreementRepository,
                                             PetProfileRepository petProfileRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.authIdentityRepository = authIdentityRepository;
        this.userProfileRepository = userProfileRepository;
        this.termsAgreementRepository = termsAgreementRepository;
        this.petProfileRepository = petProfileRepository;
    }

    @Scheduled(
        initialDelayString = "${onboarding.session.cleanup-interval-ms:60000}",
        fixedDelayString = "${onboarding.session.cleanup-interval-ms:60000}"
    )
    @Transactional
    public void cleanupExpiredOnboardingSessions() {
        Instant now = Instant.now();
        List<SignupSession> expiredSessions = sessionRepository.findByExpiresAtBeforeAndStatus(now, SignupStatus.ONBOARDING);
        if (expiredSessions.isEmpty()) {
            return;
        }

        Set<Long> userIds = expiredSessions.stream()
            .map(SignupSession::getUserId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        if (!userIds.isEmpty()) {
            List<Long> pendingUserIds = userRepository.findAllById(userIds).stream()
                .filter(user -> user.getStatus() == AccountStatus.PENDING_ONBOARDING)
                .map(user -> user.getId())
                .collect(Collectors.toList());

            if (!pendingUserIds.isEmpty()) {
                authIdentityRepository.deleteByUserIdIn(pendingUserIds);
                petProfileRepository.deleteByUserIdIn(pendingUserIds);
                termsAgreementRepository.deleteByUserIdIn(pendingUserIds);
                userProfileRepository.deleteByUserIdIn(pendingUserIds);
                userRepository.deleteAllById(pendingUserIds);
            } else {
                log.debug("No pending onboarding users found for expired sessions: {}", userIds);
            }
        }

        sessionRepository.deleteAll(expiredSessions);
        log.info("Expired onboarding sessions cleaned: {}", expiredSessions.size());
    }
}
