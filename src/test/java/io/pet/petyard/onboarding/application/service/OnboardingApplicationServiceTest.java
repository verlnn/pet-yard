package io.pet.petyard.onboarding.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import io.pet.petyard.auth.application.port.out.LoadAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.SaveAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.AuthIdentity;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.auth.oauth.OAuthClient;
import io.pet.petyard.auth.oauth.OAuthUserInfo;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.onboarding.application.port.in.OAuthCallbackUseCase.OAuthCallbackCommand;
import io.pet.petyard.onboarding.application.port.in.OAuthStartUseCase.OAuthStartCommand;
import io.pet.petyard.onboarding.application.port.in.SignupConsentsUseCase.ConsentItem;
import io.pet.petyard.onboarding.application.port.in.SignupConsentsUseCase.SignupConsentsCommand;
import io.pet.petyard.onboarding.application.port.in.SignupPetUseCase.SignupPetCommand;
import io.pet.petyard.onboarding.application.port.in.SignupProfileUseCase.SignupProfileCommand;
import io.pet.petyard.onboarding.domain.SignupStatus;
import io.pet.petyard.onboarding.domain.SignupStep;
import io.pet.petyard.onboarding.domain.model.SignupSession;
import io.pet.petyard.onboarding.application.port.out.LoadSignupSessionPort;
import io.pet.petyard.onboarding.application.port.out.SaveSignupSessionPort;
import io.pet.petyard.pet.application.port.out.SavePetProfilePort;
import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.terms.application.port.out.LoadTermsPort;
import io.pet.petyard.terms.application.port.out.SaveTermsAgreementPort;
import io.pet.petyard.terms.domain.model.Terms;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.SaveUserProfilePort;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class OnboardingApplicationServiceTest {

    @Mock private LoadSignupSessionPort loadSignupSessionPort;
    @Mock private SaveSignupSessionPort saveSignupSessionPort;
    @Mock private LoadAuthIdentityPort loadAuthIdentityPort;
    @Mock private SaveAuthIdentityPort saveAuthIdentityPort;
    @Mock private LoadUserPort loadUserPort;
    @Mock private SaveUserPort saveUserPort;
    @Mock private LoadUserProfilePort loadUserProfilePort;
    @Mock private SaveUserProfilePort saveUserProfilePort;
    @Mock private LoadTermsPort loadTermsPort;
    @Mock private SaveTermsAgreementPort saveTermsAgreementPort;
    @Mock private SavePetProfilePort savePetProfilePort;
    @Mock private AnimalRegistrationService animalRegistrationService;
    @Mock private LoadRegionPort loadRegionPort;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private OAuthClient kakaoClient;

    private Clock clock;
    private OnboardingApplicationService service;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-03-23T03:00:00Z"), ZoneOffset.UTC);
        given(kakaoClient.provider()).willReturn(AuthProvider.KAKAO);
        service = new OnboardingApplicationService(
            loadSignupSessionPort,
            saveSignupSessionPort,
            loadAuthIdentityPort,
            saveAuthIdentityPort,
            loadUserPort,
            saveUserPort,
            loadUserProfilePort,
            saveUserProfilePort,
            loadTermsPort,
            saveTermsAgreementPort,
            savePetProfilePort,
            animalRegistrationService,
            loadRegionPort,
            tokenProvider,
            clock,
            new ObjectMapper(),
            List.of(kakaoClient)
        );
    }

    @Test
    @DisplayName("OAuth 시작은 세션을 저장하고 인가 URL을 반환한다")
    void startCreatesSessionAndAuthorizeUrl() {
        given(kakaoClient.buildAuthorizeUrl(any(), any())).willReturn("https://kakao.test/authorize");

        var result = service.start(new OAuthStartCommand("kakao", "login"));

        assertThat(result.authorizeUrl()).isEqualTo("https://kakao.test/authorize");
        assertThat(result.state()).isNotBlank();
        verify(saveSignupSessionPort).save(any(SignupSession.class));
    }

    @Test
    @DisplayName("기존 활성 소셜 계정이면 로그인 토큰을 반환한다")
    void handleReturnsLoginForExistingActiveIdentity() {
        SignupSession session = session(AuthProvider.KAKAO, "oauth-state", SignupStep.OAUTH, SignupStatus.OAUTH_PENDING);
        AuthIdentity identity = new AuthIdentity(11L, AuthProvider.KAKAO, "provider-1", "owner@petyard.com");
        User user = user(11L, "owner@petyard.com", UserTier.TIER_1, AccountStatus.ACTIVE);

        given(loadSignupSessionPort.findByState("oauth-state")).willReturn(Optional.of(session));
        given(kakaoClient.fetchUser("oauth-code", "http://localhost:3000/callback"))
            .willReturn(new OAuthUserInfo("provider-1", "owner@petyard.com", "멍냥집사", "/profile.jpg"));
        given(loadAuthIdentityPort.findByProviderAndProviderUserId(AuthProvider.KAKAO, "provider-1"))
            .willReturn(Optional.of(identity));
        given(loadUserPort.findById(11L)).willReturn(Optional.of(user));
        given(tokenProvider.createAccessToken(11L, UserTier.TIER_1)).willReturn("access-token");
        given(tokenProvider.createRefreshToken()).willReturn("refresh-token");

        var result = service.handle(new OAuthCallbackCommand("kakao", "oauth-code", "oauth-state", "http://localhost:3000/callback"));

        assertThat(result.status()).isEqualTo("LOGIN");
        assertThat(result.accessToken()).isEqualTo("access-token");
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
        assertThat(session.getStatus()).isEqualTo(SignupStatus.COMPLETED);
    }

    @Test
    @DisplayName("프로필 저장은 존재하지 않는 지역 코드를 거부한다")
    void saveProfileRejectsUnknownRegion() {
        SignupSession session = tokenSession(11L, "signup-token", SignupStep.PROFILE, SignupStatus.ONBOARDING);
        given(loadSignupSessionPort.findByToken("signup-token")).willReturn(Optional.of(session));
        given(loadUserProfilePort.existsByNickname("멍냥집사")).willReturn(false);
        given(loadUserPort.findById(11L)).willReturn(Optional.of(user(11L, "owner@petyard.com", UserTier.TIER_0, AccountStatus.PENDING_ONBOARDING)));
        given(loadUserPort.existsByUsername("owner.test")).willReturn(false);
        given(loadRegionPort.findByCode("99999")).willReturn(Optional.empty());

        assertThatThrownBy(() -> service.saveProfile(new SignupProfileCommand(
            "signup-token", "멍냥집사", "Owner.Test", "99999", null, false, true
        )))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.BAD_REQUEST);
    }

    @Test
    @DisplayName("프로필 저장은 username 중복 시 실패한다")
    void saveProfileRejectsDuplicateUsername() {
        SignupSession session = tokenSession(11L, "signup-token", SignupStep.PROFILE, SignupStatus.ONBOARDING);
        User user = user(11L, "owner@petyard.com", UserTier.TIER_0, AccountStatus.PENDING_ONBOARDING);

        given(loadSignupSessionPort.findByToken("signup-token")).willReturn(Optional.of(session));
        given(loadUserProfilePort.existsByNickname("멍냥집사")).willReturn(false);
        given(loadUserPort.findById(11L)).willReturn(Optional.of(user));
        given(loadUserPort.existsByUsername("taken.user")).willReturn(true);

        assertThatThrownBy(() -> service.saveProfile(new SignupProfileCommand(
            "signup-token", "멍냥집사", "Taken.User", "11010", null, false, true
        )))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.USERNAME_ALREADY_TAKEN);
    }

    @Test
    @DisplayName("약관 저장은 필수 약관 미동의 시 실패한다")
    void saveConsentsRejectsMissingMandatoryTerms() {
        SignupSession session = tokenSession(11L, "signup-token", SignupStep.CONSENTS, SignupStatus.ONBOARDING);
        Terms mandatory = terms(1L, "SERVICE", true);

        given(loadSignupSessionPort.findByToken("signup-token")).willReturn(Optional.of(session));
        given(loadTermsPort.findByCodes(List.of("SERVICE"))).willReturn(List.of(mandatory));

        assertThatThrownBy(() -> service.saveConsents(new SignupConsentsCommand(
            "signup-token",
            List.of(new ConsentItem("SERVICE", false))
        )))
            .isInstanceOf(ApiException.class)
            .extracting("errorCode")
            .isEqualTo(ErrorCode.REQUIRED_TERMS_MISSING);
    }

    @Test
    @DisplayName("반려동물 저장은 프로필 저장 후 TIER_0 사용자를 승급시킨다")
    void savePetPersistsProfileAndPromotesTier() {
        SignupSession session = tokenSession(11L, "signup-token", SignupStep.PET, SignupStatus.ONBOARDING);
        User user = user(11L, "owner@petyard.com", UserTier.TIER_0, AccountStatus.PENDING_ONBOARDING);

        given(loadSignupSessionPort.findByToken("signup-token")).willReturn(Optional.of(session));
        given(animalRegistrationService.verify("DOG-123", "RFID-123", "홍길동", "19900101"))
            .willReturn(new AnimalRegistrationResult(
                "DOG-123", "RFID-123", "보리", java.time.LocalDate.of(2021, 5, 1), PetGender.MALE,
                "푸들", true, "기관", "02-0000-0000", "승인", "2024-01-01", "2024-01-02"
            ));
        given(loadUserPort.findById(11L)).willReturn(Optional.of(user));

        var result = service.savePet(new SignupPetCommand(
            "signup-token", "DOG-123", "RFID-123", "홍길동", "19900101", "/pet.jpg", 4.5, true, true
        ));

        assertThat(result.nextStep()).isEqualTo("CONSENTS");
        assertThat(user.getTier()).isEqualTo(UserTier.TIER_1);
        assertThat(session.getStep()).isEqualTo(SignupStep.CONSENTS);
        verify(savePetProfilePort).save(any());
        verify(saveUserPort).save(user);
    }

    private SignupSession session(AuthProvider provider, String state, SignupStep step, SignupStatus status) {
        return new SignupSession(provider, state, step, status, Instant.parse("2026-03-23T03:10:00Z"));
    }

    private SignupSession tokenSession(long userId, String token, SignupStep step, SignupStatus status) {
        SignupSession session = new SignupSession(AuthProvider.KAKAO, "oauth-state", step, status,
            Instant.parse("2026-03-23T03:10:00Z"));
        session.setUserId(userId);
        session.setSessionToken(token);
        return session;
    }

    private User user(long id, String email, UserTier tier, AccountStatus status) {
        User user = new User(email, null, "user." + id, tier, status);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private Terms terms(long id, String code, boolean mandatory) {
        Terms terms = instantiate(Terms.class);
        ReflectionTestUtils.setField(terms, "id", id);
        ReflectionTestUtils.setField(terms, "code", code);
        ReflectionTestUtils.setField(terms, "version", 1);
        ReflectionTestUtils.setField(terms, "title", code + " 약관");
        ReflectionTestUtils.setField(terms, "mandatory", mandatory);
        return terms;
    }

    private <T> T instantiate(Class<T> type) {
        try {
            var constructor = type.getDeclaredConstructor();
            constructor.setAccessible(true);
            return constructor.newInstance();
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("테스트 픽스처 생성 실패: " + type.getSimpleName(), exception);
        }
    }
}
