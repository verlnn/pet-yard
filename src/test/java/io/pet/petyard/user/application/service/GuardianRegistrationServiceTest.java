package io.pet.petyard.user.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.user.application.port.out.DeleteGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.SaveGuardianRegistrationPort;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import io.pet.petyard.user.domain.model.GuardianRegistration;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class GuardianRegistrationServiceTest {

    @Mock private LoadUserPort loadUserPort;
    @Mock private LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    @Mock private SaveGuardianRegistrationPort saveGuardianRegistrationPort;
    @Mock private DeleteGuardianRegistrationPort deleteGuardianRegistrationPort;

    private GuardianRegistrationService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-03-23T12:00:00Z"), ZoneOffset.UTC);
        GuardianRequestRateLimiter rateLimiter = new GuardianRequestRateLimiter(clock);
        service = new GuardianRegistrationService(
            loadUserPort,
            loadGuardianRegistrationPort,
            saveGuardianRegistrationPort,
            deleteGuardianRegistrationPort,
            rateLimiter
        );
    }

    @Test
    @DisplayName("관계가 없으면 집사 요청을 생성한다")
    void requestOrAcceptCreatesOutgoingRequest() {
        given(loadUserPort.findById(20L)).willReturn(Optional.of(activeUser(20L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 20L)).willReturn(Optional.empty());
        given(saveGuardianRegistrationPort.save(any(GuardianRegistration.class))).willAnswer(invocation -> invocation.getArgument(0));

        GuardianRelationStatus status = service.requestOrAccept(10L, 20L);

        assertThat(status).isEqualTo(GuardianRelationStatus.OUTGOING_REQUESTED);
        ArgumentCaptor<GuardianRegistration> captor = ArgumentCaptor.forClass(GuardianRegistration.class);
        verify(saveGuardianRegistrationPort).save(captor.capture());
        assertThat(captor.getValue().getGuardianUserId()).isEqualTo(10L);
        assertThat(captor.getValue().getTargetUserId()).isEqualTo(20L);
        assertThat(captor.getValue().isAccepted()).isFalse();
    }

    @Test
    @DisplayName("상대가 먼저 보낸 요청이 있으면 수락 후 연결 상태를 반환한다")
    void requestOrAcceptAcceptsIncomingRequest() {
        GuardianRegistration incoming = relationship(20L, 10L);
        given(loadUserPort.findById(20L)).willReturn(Optional.of(activeUser(20L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 20L)).willReturn(Optional.of(incoming));
        given(saveGuardianRegistrationPort.save(incoming)).willReturn(incoming);

        GuardianRelationStatus status = service.requestOrAccept(10L, 20L);

        assertThat(status).isEqualTo(GuardianRelationStatus.CONNECTED);
        assertThat(incoming.isAccepted()).isTrue();
        verify(saveGuardianRegistrationPort).save(incoming);
    }

    @Test
    @DisplayName("이미 연결된 관계는 다시 요청해도 연결 상태를 유지한다")
    void requestOrAcceptKeepsConnectedRelationship() {
        GuardianRegistration connected = relationship(10L, 20L);
        connected.accept();
        given(loadUserPort.findById(20L)).willReturn(Optional.of(activeUser(20L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 20L)).willReturn(Optional.of(connected));

        GuardianRelationStatus status = service.requestOrAccept(10L, 20L);

        assertThat(status).isEqualTo(GuardianRelationStatus.CONNECTED);
        verify(saveGuardianRegistrationPort, never()).save(any());
    }

    @Test
    @DisplayName("관계 제거는 요청 취소와 연결 해제를 모두 NONE으로 돌린다")
    void removeDeletesRelationship() {
        given(loadUserPort.findById(20L)).willReturn(Optional.of(activeUser(20L)));

        GuardianRelationStatus status = service.remove(10L, 20L);

        assertThat(status).isEqualTo(GuardianRelationStatus.NONE);
        verify(deleteGuardianRegistrationPort).delete(10L, 20L);
    }

    @Test
    @DisplayName("1초 안에 4번째 집사 요청은 비인가적인 활동으로 차단한다")
    void requestOrAcceptRejectsSuspiciousBurstTraffic() {
        given(loadUserPort.findById(20L)).willReturn(Optional.of(activeUser(20L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 20L)).willReturn(Optional.empty());
        given(loadUserPort.findById(21L)).willReturn(Optional.of(activeUser(21L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 21L)).willReturn(Optional.empty());
        given(loadUserPort.findById(22L)).willReturn(Optional.of(activeUser(22L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 22L)).willReturn(Optional.empty());
        given(loadUserPort.findById(23L)).willReturn(Optional.of(activeUser(23L)));
        given(loadGuardianRegistrationPort.findRelationship(10L, 23L)).willReturn(Optional.empty());
        given(saveGuardianRegistrationPort.save(any(GuardianRegistration.class))).willAnswer(invocation -> invocation.getArgument(0));

        service.requestOrAccept(10L, 20L);
        service.requestOrAccept(10L, 21L);
        service.requestOrAccept(10L, 22L);

        assertThatThrownBy(() -> service.requestOrAccept(10L, 23L))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.GUARDIAN_REQUEST_RATE_LIMIT);
    }

    @Test
    @DisplayName("자기 자신에게는 집사 요청을 보낼 수 없다")
    void requestOrAcceptRejectsSelfTarget() {
        assertThatThrownBy(() -> service.requestOrAccept(10L, 10L))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.BAD_REQUEST);
    }

    private GuardianRegistration relationship(Long guardianUserId, Long targetUserId) {
        GuardianRegistration relationship = new GuardianRegistration(guardianUserId, targetUserId);
        ReflectionTestUtils.setField(relationship, "createdAt", Instant.parse("2026-03-23T12:00:00Z"));
        return relationship;
    }

    private User activeUser(long userId) {
        User user = new User("guardian" + userId + "@petyard.local", "hash", "user." + userId, UserTier.TIER_1, AccountStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", userId);
        return user;
    }
}
