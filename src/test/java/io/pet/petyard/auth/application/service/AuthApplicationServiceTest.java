package io.pet.petyard.auth.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import io.pet.petyard.auth.application.port.in.AuthTokens;
import io.pet.petyard.auth.application.port.in.ExtendEmailVerificationUseCase.ExtendCommand;
import io.pet.petyard.auth.application.port.in.LoginUseCase.LoginCommand;
import io.pet.petyard.auth.application.port.in.RefreshTokenUseCase.RefreshTokenCommand;
import io.pet.petyard.auth.application.port.in.SignUpUseCase.SignUpCommand;
import io.pet.petyard.auth.application.port.in.VerifyEmailUseCase.VerifyEmailCommand;
import io.pet.petyard.auth.application.port.out.EmailSender;
import io.pet.petyard.auth.application.port.out.LoadAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.LoadLatestPendingEmailVerificationPort;
import io.pet.petyard.auth.application.port.out.LoadRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.RevokeRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.SaveAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.SaveEmailVerificationPort;
import io.pet.petyard.auth.application.port.out.SaveRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.AuthIdentity;
import io.pet.petyard.auth.domain.model.EmailVerification;
import io.pet.petyard.auth.domain.model.RefreshToken;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AuthApplicationServiceTest {

    @Mock private LoadUserPort loadUserPort;
    @Mock private SaveUserPort saveUserPort;
    @Mock private LoadAuthIdentityPort loadAuthIdentityPort;
    @Mock private SaveAuthIdentityPort saveAuthIdentityPort;
    @Mock private SaveEmailVerificationPort saveEmailVerificationPort;
    @Mock private LoadLatestPendingEmailVerificationPort loadLatestPendingEmailVerificationPort;
    @Mock private SaveRefreshTokenPort saveRefreshTokenPort;
    @Mock private LoadRefreshTokenPort loadRefreshTokenPort;
    @Mock private RevokeRefreshTokenPort revokeRefreshTokenPort;
    @Mock private EmailSender emailSender;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private OtpGenerator otpGenerator;

    private Clock clock;
    private AuthApplicationService service;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-03-23T03:00:00Z"), ZoneOffset.UTC);
        service = new AuthApplicationService(
            loadUserPort,
            saveUserPort,
            loadAuthIdentityPort,
            saveAuthIdentityPort,
            saveEmailVerificationPort,
            loadLatestPendingEmailVerificationPort,
            saveRefreshTokenPort,
            loadRefreshTokenPort,
            revokeRefreshTokenPort,
            emailSender,
            passwordEncoder,
            tokenProvider,
            clock,
            otpGenerator
        );
    }

    @Test
    @DisplayName("회원가입은 대기 사용자와 인증 코드를 저장하고 메일을 보낸다")
    void signupCreatesPendingUserAndVerification() {
        given(loadUserPort.existsByEmail("owner@petyard.com")).willReturn(false);
        given(loadUserPort.existsByUsername("petyard.owner")).willReturn(false);
        given(loadAuthIdentityPort.findByEmail("owner@petyard.com")).willReturn(Optional.empty());
        given(passwordEncoder.encode("plain-password")).willReturn("encoded-password");
        given(otpGenerator.generate("owner@petyard.com")).willReturn("123456");
        given(passwordEncoder.encode("123456")).willReturn("encoded-otp");
        given(saveUserPort.save(any(User.class))).willAnswer(invocation -> {
            User user = invocation.getArgument(0);
            ReflectionTestUtils.setField(user, "id", 11L);
            return user;
        });

        var result = service.signup(new SignUpCommand("owner@petyard.com", "plain-password", "PetYard.Owner"));

        assertThat(result.userId()).isEqualTo(11L);
        assertThat(result.email()).isEqualTo("owner@petyard.com");
        assertThat(result.username()).isEqualTo("petyard.owner");
        verify(saveAuthIdentityPort).save(any(AuthIdentity.class));
        verify(saveEmailVerificationPort).save(any(EmailVerification.class));
        verify(emailSender).send(any(), any(), any());
    }

    @Test
    @DisplayName("이메일 인증 성공 시 사용자 상태를 ACTIVE로 변경한다")
    void verifyEmailActivatesUser() {
        EmailVerification verification = new EmailVerification(11L, "owner@petyard.com", "encoded-otp",
            Instant.parse("2026-03-23T03:03:00Z"), Instant.parse("2026-03-23T03:00:00Z"));
        User user = user(11L, "owner@petyard.com", AccountStatus.PENDING_VERIFICATION, UserTier.TIER_0, "encoded-password");

        given(loadLatestPendingEmailVerificationPort.loadLatestPendingByEmail("owner@petyard.com"))
            .willReturn(Optional.of(verification));
        given(passwordEncoder.matches("123456", "encoded-otp")).willReturn(true);
        given(loadUserPort.findByEmail("owner@petyard.com")).willReturn(Optional.of(user));

        service.verifyEmail(new VerifyEmailCommand("owner@petyard.com", "123456"));

        assertThat(verification.isVerified()).isTrue();
        assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
    }

    @Test
    @DisplayName("비활성 계정으로 로그인하면 거부한다")
    void loginRejectsInactiveAccount() {
        User user = user(11L, "owner@petyard.com", AccountStatus.PENDING_VERIFICATION, UserTier.TIER_0, "encoded-password");
        given(loadUserPort.findByEmail("owner@petyard.com")).willReturn(Optional.of(user));

        assertThatThrownBy(() -> service.login(new LoginCommand("owner@petyard.com", "plain-password")))
            .isInstanceOf(AccessDeniedException.class)
            .hasMessage(ErrorCode.ACCOUNT_NOT_ACTIVE.message());
    }

    @Test
    @DisplayName("리프레시 토큰 갱신은 기존 토큰을 폐기하고 새 토큰을 저장한다")
    void refreshRotatesRefreshToken() {
        RefreshToken stored = new RefreshToken(11L, "hashed-old", Instant.parse("2026-03-24T03:00:00Z"), clock.instant());
        User user = user(11L, "owner@petyard.com", AccountStatus.ACTIVE, UserTier.TIER_1, "encoded-password");

        given(tokenProvider.hashRefreshToken("raw-old")).willReturn("hashed-old");
        given(loadRefreshTokenPort.loadByTokenHash("hashed-old")).willReturn(Optional.of(stored));
        given(loadUserPort.findById(11L)).willReturn(Optional.of(user));
        given(tokenProvider.createAccessToken(11L, UserTier.TIER_1)).willReturn("new-access");
        given(tokenProvider.createRefreshToken()).willReturn("new-refresh");
        given(tokenProvider.hashRefreshToken("new-refresh")).willReturn("hashed-new");
        given(tokenProvider.refreshExpiry()).willReturn(Instant.parse("2026-03-24T03:00:00Z"));

        AuthTokens tokens = service.refresh(new RefreshTokenCommand("raw-old"));

        assertThat(tokens.accessToken()).isEqualTo("new-access");
        assertThat(tokens.refreshToken()).isEqualTo("new-refresh");
        assertThat(stored.isRevoked()).isTrue();
        verify(revokeRefreshTokenPort).revoke(stored);
        verify(saveRefreshTokenPort).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("짧은 시간 안에 인증 연장을 과도하게 요청하면 제한한다")
    void extendEmailRejectsRateLimitExceeded() {
        EmailVerification verification = new EmailVerification(11L, "owner@petyard.com", "encoded-otp",
            Instant.parse("2026-03-23T03:03:00Z"), Instant.parse("2026-03-23T03:00:00Z"));
        verification.canExtend(clock.instant(), 1000, 2);
        verification.canExtend(clock.instant(), 1000, 2);
        given(loadLatestPendingEmailVerificationPort.loadLatestPendingByEmail("owner@petyard.com"))
            .willReturn(Optional.of(verification));

        assertThatThrownBy(() -> service.extendEmail(new ExtendCommand("owner@petyard.com")))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.VERIFICATION_EXTEND_RATE_LIMIT);
    }

    @Test
    @DisplayName("회원가입은 이미 사용 중인 username이면 거부한다")
    void signupRejectsDuplicateUsername() {
        given(loadUserPort.existsByEmail("owner@petyard.com")).willReturn(false);
        given(loadAuthIdentityPort.findByEmail("owner@petyard.com")).willReturn(Optional.empty());
        given(loadUserPort.existsByUsername("taken.user")).willReturn(true);

        assertThatThrownBy(() -> service.signup(new SignUpCommand("owner@petyard.com", "plain-password", "Taken.User")))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.USERNAME_ALREADY_TAKEN);
    }

    private User user(long id, String email, AccountStatus status, UserTier tier, String passwordHash) {
        User user = new User(email, passwordHash, "user." + id, tier, status);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
