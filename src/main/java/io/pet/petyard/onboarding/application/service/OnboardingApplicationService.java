package io.pet.petyard.onboarding.application.service;

import io.pet.petyard.auth.application.port.out.LoadAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.SaveAuthIdentityPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.domain.Username;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.AuthIdentity;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.auth.oauth.OAuthClient;
import io.pet.petyard.auth.oauth.OAuthUserInfo;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.onboarding.application.port.in.OAuthCallbackUseCase;
import io.pet.petyard.onboarding.application.port.in.OAuthStartUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupCompleteUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupConsentsUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupPetUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProfileUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProgressUseCase;
import io.pet.petyard.onboarding.application.port.out.LoadSignupSessionPort;
import io.pet.petyard.onboarding.application.port.out.SaveSignupSessionPort;
import io.pet.petyard.onboarding.domain.SignupStatus;
import io.pet.petyard.onboarding.domain.SignupStep;
import io.pet.petyard.onboarding.domain.model.SignupSession;
import io.pet.petyard.pet.application.port.out.SavePetProfilePort;
import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.terms.application.port.out.LoadTermsPort;
import io.pet.petyard.terms.application.port.out.SaveTermsAgreementPort;
import io.pet.petyard.terms.domain.model.Terms;
import io.pet.petyard.terms.domain.model.TermsAgreement;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.SaveUserProfilePort;
import io.pet.petyard.user.domain.model.UserProfile;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tools.jackson.databind.ObjectMapper;

@Service
public class OnboardingApplicationService implements OAuthStartUseCase, OAuthCallbackUseCase, SignupProgressUseCase,
    SignupProfileUseCase, SignupConsentsUseCase, SignupPetUseCase, SignupCompleteUseCase {

    private static final int SESSION_TTL_MINUTES = 10;

    private final LoadSignupSessionPort loadSignupSessionPort;
    private final SaveSignupSessionPort saveSignupSessionPort;
    private final LoadAuthIdentityPort loadAuthIdentityPort;
    private final SaveAuthIdentityPort saveAuthIdentityPort;
    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final LoadUserProfilePort loadUserProfilePort;
    private final SaveUserProfilePort saveUserProfilePort;
    private final LoadTermsPort loadTermsPort;
    private final SaveTermsAgreementPort saveTermsAgreementPort;
    private final SavePetProfilePort savePetProfilePort;
    private final AnimalRegistrationService animalRegistrationService;
    private final LoadRegionPort loadRegionPort;
    private final JwtTokenProvider tokenProvider;
    private final Clock clock;
    private final ObjectMapper objectMapper;
    private final Map<AuthProvider, OAuthClient> oauthClients;

    public OnboardingApplicationService(LoadSignupSessionPort loadSignupSessionPort,
                                        SaveSignupSessionPort saveSignupSessionPort,
                                        LoadAuthIdentityPort loadAuthIdentityPort,
                                        SaveAuthIdentityPort saveAuthIdentityPort,
                                        LoadUserPort loadUserPort,
                                        SaveUserPort saveUserPort,
                                        LoadUserProfilePort loadUserProfilePort,
                                        SaveUserProfilePort saveUserProfilePort,
                                        LoadTermsPort loadTermsPort,
                                        SaveTermsAgreementPort saveTermsAgreementPort,
                                        SavePetProfilePort savePetProfilePort,
                                        AnimalRegistrationService animalRegistrationService,
                                        LoadRegionPort loadRegionPort,
                                        JwtTokenProvider tokenProvider,
                                        Clock clock,
                                        ObjectMapper objectMapper,
                                        List<OAuthClient> oauthClients) {
        this.loadSignupSessionPort = loadSignupSessionPort;
        this.saveSignupSessionPort = saveSignupSessionPort;
        this.loadAuthIdentityPort = loadAuthIdentityPort;
        this.saveAuthIdentityPort = saveAuthIdentityPort;
        this.loadUserPort = loadUserPort;
        this.saveUserPort = saveUserPort;
        this.loadUserProfilePort = loadUserProfilePort;
        this.saveUserProfilePort = saveUserProfilePort;
        this.loadTermsPort = loadTermsPort;
        this.saveTermsAgreementPort = saveTermsAgreementPort;
        this.savePetProfilePort = savePetProfilePort;
        this.animalRegistrationService = animalRegistrationService;
        this.loadRegionPort = loadRegionPort;
        this.tokenProvider = tokenProvider;
        this.clock = clock;
        this.objectMapper = objectMapper;
        this.oauthClients = oauthClients.stream().collect(Collectors.toMap(OAuthClient::provider, client -> client));
    }

    @Transactional
    @Override
    public OAuthStartResult start(OAuthStartCommand command) {
        AuthProvider provider = AuthProvider.valueOf(command.provider().toUpperCase());
        OAuthClient client = resolveClient(provider);

        String state = UUID.randomUUID().toString();
        Instant now = clock.instant();
        Instant expiresAt = now.plusSeconds(SESSION_TTL_MINUTES * 60L);

        SignupSession session = new SignupSession(provider, state, SignupStep.OAUTH, SignupStatus.OAUTH_PENDING, expiresAt);
        saveSignupSessionPort.save(session);

        return new OAuthStartResult(client.buildAuthorizeUrl(state, command.prompt()), state, expiresAt.toString());
    }

    @Transactional
    @Override
    public OAuthCallbackResult handle(OAuthCallbackCommand command) {
        AuthProvider provider = AuthProvider.valueOf(command.provider().toUpperCase());
        OAuthClient client = resolveClient(provider);

        SignupSession session = loadSignupSessionPort.findByState(command.state())
            .orElseThrow(() -> new ApiException(ErrorCode.OAUTH_STATE_MISMATCH));

        if (session.isExpired(clock.instant())) {
            throw new ApiException(ErrorCode.SIGNUP_SESSION_EXPIRED);
        }
        if (session.getProvider() != provider) {
            throw new ApiException(ErrorCode.OAUTH_STATE_MISMATCH);
        }

        OAuthUserInfo userInfo = client.fetchUser(command.code(), command.redirectUri());

        AuthIdentity existing = loadAuthIdentityPort
            .findByProviderAndProviderUserId(provider, userInfo.providerUserId())
            .orElse(null);

        if (existing != null) {
            User user = loadUserPort.findById(existing.getUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
            if (user.getStatus() == AccountStatus.SUSPENDED || user.getStatus() == AccountStatus.WITHDRAWN
                || user.getStatus() == AccountStatus.DELETED) {
                throw new ApiException(ErrorCode.FORBIDDEN);
            }
            if (user.getStatus() == AccountStatus.ACTIVE) {
                session.setStatus(SignupStatus.COMPLETED);
                saveSignupSessionPort.save(session);

                String accessToken = tokenProvider.createAccessToken(user.getId(), user.getTier());
                String refreshToken = tokenProvider.createRefreshToken();
                return new OAuthCallbackResult("LOGIN", null, null, accessToken, refreshToken);
            }
            return createOnboardingSession(session, user, userInfo);
        }

        if (userInfo.email() != null) {
            if (loadAuthIdentityPort.findByEmail(userInfo.email()).isPresent()) {
                throw new ApiException(ErrorCode.SOCIAL_EMAIL_CONFLICT);
            }
            if (loadUserPort.existsByEmail(userInfo.email())) {
                throw new ApiException(ErrorCode.SOCIAL_EMAIL_CONFLICT);
            }
        }

        User user = new User(userInfo.email(), null, temporaryUsername(), UserTier.TIER_0, AccountStatus.PENDING_ONBOARDING);
        saveUserPort.save(user);

        saveAuthIdentityPort.save(new AuthIdentity(user.getId(), provider, userInfo.providerUserId(), userInfo.email()));

        return createOnboardingSession(session, user, userInfo);
    }

    @Transactional(readOnly = true)
    @Override
    public SignupProgressResult progress(SignupProgressQuery query) {
        SignupSession session = findActiveSession(query.signupToken());
        Map<String, String> metadata = decodeMetadata(session.getMetadata());
        return new SignupProgressResult(
            session.getStep().name(),
            session.getExpiresAt().toString(),
            loadUserProfilePort.findByUserId(session.getUserId()).map(UserProfile::hasPet).orElse(false),
            metadata.get("nickname"),
            metadata.get("username"),
            metadata.get("profileImageUrl")
        );
    }

    @Transactional
    @Override
    public SignupProfileResult saveProfile(SignupProfileCommand command) {
        SignupSession session = findActiveSession(command.signupToken());
        ensureStep(session, SignupStep.PROFILE);

        if (loadUserProfilePort.existsByNickname(command.nickname())) {
            throw new ApiException(ErrorCode.NICKNAME_ALREADY_TAKEN);
        }
        String normalizedUsername = parseUsername(command.username());
        User user = loadUserPort.findById(session.getUserId())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        if (!normalizedUsername.equals(user.getUsername()) && loadUserPort.existsByUsername(normalizedUsername)) {
            throw new ApiException(ErrorCode.USERNAME_ALREADY_TAKEN);
        }
        if (command.regionCode() != null && !command.regionCode().isBlank()
            && loadRegionPort.findByCode(command.regionCode()).isEmpty()) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }

        user.setUsername(normalizedUsername);
        saveUserPort.save(user);

        UserProfile profile = new UserProfile(session.getUserId(), command.nickname(), command.regionCode(),
            command.profileImageUrl(), command.marketingOptIn(), command.hasPet());
        saveUserProfilePort.save(profile);

        session.setStep(command.hasPet() ? SignupStep.PET : SignupStep.CONSENTS);
        session.setStatus(SignupStatus.ONBOARDING);
        saveSignupSessionPort.save(session);

        return new SignupProfileResult(session.getStep().name());
    }

    @Transactional
    @Override
    public SignupConsentsResult saveConsents(SignupConsentsCommand command) {
        SignupSession session = findActiveSession(command.signupToken());
        ensureStep(session, SignupStep.CONSENTS);

        List<String> requestedCodes = command.consents().stream().map(ConsentItem::code).toList();
        List<Terms> termsList = loadTermsPort.findByCodes(requestedCodes);

        List<String> mandatoryCodes = termsList.stream()
            .filter(Terms::isMandatory)
            .map(Terms::getCode)
            .toList();

        List<String> agreedMandatory = command.consents().stream()
            .filter(ConsentItem::agreed)
            .map(ConsentItem::code)
            .toList();

        if (!agreedMandatory.containsAll(mandatoryCodes)) {
            throw new ApiException(ErrorCode.REQUIRED_TERMS_MISSING);
        }

        Instant now = clock.instant();
        Map<String, Terms> termsMap = termsList.stream().collect(Collectors.toMap(Terms::getCode, t -> t));
        for (ConsentItem item : command.consents()) {
            if (!item.agreed()) {
                continue;
            }
            Terms terms = termsMap.get(item.code());
            if (terms == null) {
                continue;
            }
            saveTermsAgreementPort.save(new TermsAgreement(session.getUserId(), terms.getId(), now));
        }

        session.setStep(SignupStep.COMPLETE);
        saveSignupSessionPort.save(session);

        return new SignupConsentsResult(session.getStep().name());
    }

    @Transactional
    @Override
    public SignupPetResult savePet(SignupPetCommand command) {
        SignupSession session = findActiveSession(command.signupToken());
        ensureStep(session, SignupStep.PET);

        AnimalRegistrationResult result = animalRegistrationService.verify(
            command.dogRegNo(),
            command.rfidCd(),
            command.ownerNm(),
            command.ownerBirth()
        );

        PetProfile profile = new PetProfile(
            session.getUserId(),
            result.name(),
            PetSpecies.DOG,
            result.breed(),
            result.birthDate(),
            null,
            result.gender(),
            result.neutered(),
            null,
            command.photoUrl(),
            command.weightKg() == null ? null : java.math.BigDecimal.valueOf(command.weightKg()),
            command.vaccinationComplete(),
            command.walkSafetyChecked()
        );
        savePetProfilePort.save(profile);
        promoteTierIfNeeded(session.getUserId());

        session.setStep(SignupStep.CONSENTS);
        saveSignupSessionPort.save(session);

        return new SignupPetResult(session.getStep().name());
    }

    @Transactional
    @Override
    public SignupCompleteResult complete(SignupCompleteCommand command) {
        SignupSession session = findActiveSession(command.signupToken());
        ensureStep(session, SignupStep.COMPLETE);

        User user = loadUserPort.findById(session.getUserId())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(AccountStatus.ACTIVE);
        saveUserPort.save(user);

        session.setStatus(SignupStatus.COMPLETED);
        saveSignupSessionPort.save(session);

        String accessToken = tokenProvider.createAccessToken(user.getId(), user.getTier());
        String refreshToken = tokenProvider.createRefreshToken();
        return new SignupCompleteResult(accessToken, refreshToken);
    }

    private OAuthCallbackResult createOnboardingSession(SignupSession session, User user, OAuthUserInfo userInfo) {
        session.setUserId(user.getId());
        session.setStatus(SignupStatus.ONBOARDING);
        session.setStep(SignupStep.PROFILE);
        session.setSessionToken(UUID.randomUUID().toString());
        session.setMetadata(encodeMetadata(userInfo));
        saveSignupSessionPort.save(session);

        return new OAuthCallbackResult("ONBOARDING", session.getSessionToken(), session.getStep().name(), null, null);
    }

    private SignupSession findActiveSession(String token) {
        SignupSession session = loadSignupSessionPort.findByToken(token)
            .orElseThrow(() -> new ApiException(ErrorCode.SIGNUP_SESSION_EXPIRED));
        if (session.isExpired(clock.instant())) {
            throw new ApiException(ErrorCode.SIGNUP_SESSION_EXPIRED);
        }
        return session;
    }

    private void ensureStep(SignupSession session, SignupStep expected) {
        if (session.getStep() != expected) {
            throw new ApiException(ErrorCode.SIGNUP_STEP_INVALID);
        }
    }

    private OAuthClient resolveClient(AuthProvider provider) {
        OAuthClient client = oauthClients.get(provider);
        if (client == null) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        return client;
    }

    private void promoteTierIfNeeded(Long userId) {
        User user = loadUserPort.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        if (user.getTier() == UserTier.TIER_0) {
            user.setTier(UserTier.TIER_1);
            saveUserPort.save(user);
        }
    }

    private String encodeMetadata(OAuthUserInfo userInfo) {
        try {
            Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("email", userInfo.email());
            payload.put("nickname", userInfo.nickname());
            payload.put("username", suggestInitialUsername(userInfo, null));
            payload.put("profileImageUrl", userInfo.profileImageUrl());
            return objectMapper.writeValueAsString(payload);
        } catch (Exception ex) {
            return null;
        }
    }

    private Map<String, String> decodeMetadata(String metadata) {
        if (metadata == null || metadata.isBlank()) {
            return java.util.Collections.emptyMap();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(metadata, Map.class);
            Map<String, String> result = new java.util.HashMap<>();
            if (payload.get("nickname") != null) {
                result.put("nickname", payload.get("nickname").toString());
            }
            if (payload.get("username") != null) {
                result.put("username", payload.get("username").toString());
            }
            if (payload.get("profileImageUrl") != null) {
                result.put("profileImageUrl", payload.get("profileImageUrl").toString());
            }
            return result;
        } catch (Exception ex) {
            return java.util.Collections.emptyMap();
        }
    }

    private String parseUsername(String raw) {
        try {
            return Username.fromRaw(raw).value();
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.INVALID_USERNAME);
        }
    }

    private String suggestInitialUsername(OAuthUserInfo userInfo, Long userId) {
        if (userInfo.email() != null) {
            int atIndex = userInfo.email().indexOf('@');
            String emailLocalPart = atIndex > 0 ? userInfo.email().substring(0, atIndex) : userInfo.email();
            String normalizedEmailLocalPart = Username.normalize(emailLocalPart);
            if (Username.isValidNormalized(normalizedEmailLocalPart)) {
                return normalizedEmailLocalPart;
            }
        }

        String normalizedNickname = Username.normalize(userInfo.nickname());
        if (Username.isValidNormalized(normalizedNickname)) {
            return normalizedNickname;
        }

        return userId == null ? null : Username.legacyFallback(userId);
    }

    private String temporaryUsername() {
        return "u." + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
