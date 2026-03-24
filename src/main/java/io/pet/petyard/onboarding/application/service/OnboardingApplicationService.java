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
import io.pet.petyard.common.storage.LocalFileStorage;
import io.pet.petyard.onboarding.OnboardingSessionProperties;
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

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
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
    private final OnboardingSessionProperties sessionProperties;
    private final LocalFileStorage localFileStorage;

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
                                        List<OAuthClient> oauthClients,
                                        OnboardingSessionProperties sessionProperties,
                                        LocalFileStorage localFileStorage) {
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
        this.sessionProperties = sessionProperties;
        this.localFileStorage = localFileStorage;
    }

    @Transactional
    @Override
    public OAuthStartResult start(OAuthStartCommand command) {
        AuthProvider provider = AuthProvider.valueOf(command.provider().toUpperCase());
        OAuthClient client = resolveClient(provider);

        String state = UUID.randomUUID().toString();
        Instant now = clock.instant();
        Instant expiresAt = now.plusSeconds(sessionProperties.getTtlMinutes() * 60L);

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
            return startOnboardingSession(session, provider, userInfo);
        }

        if (userInfo.email() != null) {
            if (loadAuthIdentityPort.findByEmail(userInfo.email()).isPresent()) {
                throw new ApiException(ErrorCode.SOCIAL_EMAIL_CONFLICT);
            }
            if (loadUserPort.existsByEmail(userInfo.email())) {
                throw new ApiException(ErrorCode.SOCIAL_EMAIL_CONFLICT);
            }
        }

        return startOnboardingSession(session, provider, userInfo);
    }

    @Transactional(readOnly = true)
    @Override
    public SignupProgressResult progress(SignupProgressQuery query) {
        SignupSession session = findActiveSession(query.signupToken());
        SignupSessionMetadata metadata = loadMetadata(session);
        boolean hasPet = Boolean.TRUE.equals(metadata.getHasPet()) || metadata.getPet() != null;
        return new SignupProgressResult(
            session.getStep().name(),
            session.getExpiresAt().toString(),
            hasPet,
            metadata.getNickname(),
            metadata.getUsername(),
            metadata.getProfileImageUrl()
        );
    }

    @Transactional
    @Override
    public SignupUsernameValidationResult validateUsername(SignupUsernameValidationCommand command) {
        SignupSession session = findActiveSession(command.signupToken());
        ensureStep(session, SignupStep.PROFILE);

        String normalizedUsername = parseUsername(command.username());
        if (loadUserPort.existsByUsername(normalizedUsername)) {
            throw new ApiException(ErrorCode.USERNAME_ALREADY_TAKEN);
        }

        return new SignupUsernameValidationResult(normalizedUsername);
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
        if (loadUserPort.existsByUsername(normalizedUsername)) {
            throw new ApiException(ErrorCode.USERNAME_ALREADY_TAKEN);
        }
        if (command.regionCode() != null && !command.regionCode().isBlank()
            && loadRegionPort.findByCode(command.regionCode()).isEmpty()) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }

        SignupSessionMetadata metadata = loadMetadata(session);
        metadata.setNickname(command.nickname());
        metadata.setUsername(normalizedUsername);
        metadata.setRegionCode(command.regionCode());
        metadata.setProfileImageUrl(command.profileImageUrl());
        metadata.setMarketingOptIn(command.marketingOptIn());
        metadata.setHasPet(command.hasPet());

        session.setStep(command.hasPet() ? SignupStep.PET : SignupStep.CONSENTS);
        session.setStatus(SignupStatus.ONBOARDING);
        saveMetadata(session, metadata);
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

        SignupSessionMetadata metadata = loadMetadata(session);
        metadata.setConsents(command.consents().stream()
            .filter(ConsentItem::agreed)
            .map(ConsentItem::code)
            .toList());

        session.setStep(SignupStep.COMPLETE);
        saveMetadata(session, metadata);
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
        session.setStep(SignupStep.CONSENTS);
        SignupSessionMetadata metadata = loadMetadata(session);
        PetMetadata petMetadata = new PetMetadata();
        petMetadata.setDogRegNo(command.dogRegNo());
        petMetadata.setRfidCd(command.rfidCd());
        petMetadata.setOwnerNm(command.ownerNm());
        petMetadata.setOwnerBirth(command.ownerBirth());
        petMetadata.setPhotoUrl(command.photoUrl());
        petMetadata.setWeightKg(command.weightKg());
        petMetadata.setVaccinationComplete(command.vaccinationComplete());
        petMetadata.setWalkSafetyChecked(command.walkSafetyChecked());
        petMetadata.setName(result.name());
        petMetadata.setBreed(result.breed());
        petMetadata.setBirthDate(result.birthDate().toString());
        petMetadata.setGender(result.gender().name());
        petMetadata.setNeutered(result.neutered());
        metadata.setPet(petMetadata);
        metadata.setHasPet(true);

        saveMetadata(session, metadata);
        saveSignupSessionPort.save(session);

        return new SignupPetResult(session.getStep().name());
    }

    @Transactional
    @Override
    public SignupCompleteResult complete(SignupCompleteCommand command) {
        SignupSession session = findActiveSession(command.signupToken());
        ensureStep(session, SignupStep.COMPLETE);

        SignupSessionMetadata metadata = loadMetadata(session);
        String username = metadata.getUsername();
        if (username == null || username.isBlank()) {
            throw new ApiException(ErrorCode.SIGNUP_STEP_INVALID);
        }
        String emailValue = metadata.getEmail();
        String email = (emailValue == null || emailValue.isBlank()) ? null : emailValue;
        String providerValue = metadata.getProvider();
        String providerUserId = metadata.getProviderUserId();
        if (providerValue == null || providerUserId == null) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }

        User user = new User(email, null, username, UserTier.TIER_0, AccountStatus.ACTIVE);
        saveUserPort.save(user);

        AuthProvider provider = resolveProvider(providerValue);
        saveAuthIdentityPort.save(new AuthIdentity(user.getId(), provider, providerUserId, email));

        UserProfile profile = new UserProfile(
            user.getId(),
            metadata.getNickname(),
            metadata.getRegionCode(),
            metadata.getProfileImageUrl(),
            Boolean.TRUE.equals(metadata.getMarketingOptIn()),
            Boolean.TRUE.equals(metadata.getHasPet())
        );
        saveUserProfilePort.save(profile);

        java.util.List<String> consentCodes = metadata.getConsents();
        if (consentCodes == null) {
            consentCodes = java.util.List.of();
        }
        java.util.List<Terms> termsList = loadTermsPort.findByCodes(consentCodes);
        java.util.Map<String, Terms> termMap = termsList.stream()
            .collect(Collectors.toMap(Terms::getCode, t -> t));
        Instant now = clock.instant();
        for (String code : consentCodes) {
            Terms terms = termMap.get(code);
            if (terms == null) {
                continue;
            }
            saveTermsAgreementPort.save(new TermsAgreement(user.getId(), terms.getId(), now));
        }

        if (Boolean.TRUE.equals(metadata.getHasPet()) && metadata.getPet() != null) {
            PetMetadata petData = metadata.getPet();
            LocalDate birthDate = LocalDate.parse(petData.getBirthDate());
            String resolvedPhoto = petData.getPhotoUrl() == null
                ? null
                : localFileStorage.resolvePetImage(user.getId(), petData.getPhotoUrl(), null);
            PetProfile petProfile = new PetProfile(
                user.getId(),
                petData.getName(),
                PetSpecies.DOG,
                petData.getBreed(),
                birthDate,
                null,
                PetGender.valueOf(petData.getGender()),
                Boolean.TRUE.equals(petData.getNeutered()),
                null,
                resolvedPhoto,
                petData.getWeightKg() == null ? null : java.math.BigDecimal.valueOf(petData.getWeightKg()),
                Boolean.TRUE.equals(petData.getVaccinationComplete()),
                Boolean.TRUE.equals(petData.getWalkSafetyChecked())
            );
            savePetProfilePort.save(petProfile);
            promoteTierIfNeeded(user.getId());
        }

        session.setUserId(user.getId());
        session.setStatus(SignupStatus.COMPLETED);
        saveSignupSessionPort.save(session);

        String accessToken = tokenProvider.createAccessToken(user.getId(), user.getTier());
        String refreshToken = tokenProvider.createRefreshToken();
        return new SignupCompleteResult(accessToken, refreshToken);
    }

    private OAuthCallbackResult startOnboardingSession(SignupSession session, AuthProvider provider, OAuthUserInfo userInfo) {
        SignupSessionMetadata metadata = createInitialMetadata(userInfo, provider);
        session.setStatus(SignupStatus.ONBOARDING);
        session.setStep(SignupStep.PROFILE);
        session.setSessionToken(UUID.randomUUID().toString());
        saveMetadata(session, metadata);
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

    private String parseUsername(String raw) {
        try {
            return Username.fromRaw(raw).value();
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.INVALID_USERNAME);
        }
    }

    private OAuthClient resolveClient(AuthProvider provider) {
        OAuthClient client = oauthClients.get(provider);
        if (client == null) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
        return client;
    }

    private AuthProvider resolveProvider(String provider) {
        try {
            return AuthProvider.valueOf(provider);
        } catch (IllegalArgumentException exception) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }
    }

    private void promoteTierIfNeeded(Long userId) {
        User user = loadUserPort.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        if (user.getTier() == UserTier.TIER_0) {
            user.setTier(UserTier.TIER_1);
            saveUserPort.save(user);
        }
    }

    private SignupSessionMetadata loadMetadata(SignupSession session) {
        String payload = session.getMetadata();
        if (payload == null || payload.isBlank()) {
            return new SignupSessionMetadata();
        }
        try {
            SignupSessionMetadata metadata = objectMapper.readValue(payload, SignupSessionMetadata.class);
            if (metadata.getConsents() == null) {
                metadata.setConsents(new java.util.ArrayList<>());
            }
            return metadata;
        } catch (Exception ex) {
            return new SignupSessionMetadata();
        }
    }

    private void saveMetadata(SignupSession session, SignupSessionMetadata metadata) {
        try {
            session.setMetadata(metadata == null ? null : objectMapper.writeValueAsString(metadata));
        } catch (Exception ex) {
            session.setMetadata(null);
        }
    }

    private SignupSessionMetadata createInitialMetadata(OAuthUserInfo userInfo, AuthProvider provider) {
        SignupSessionMetadata metadata = new SignupSessionMetadata();
        metadata.setEmail(userInfo.email());
        metadata.setNickname(userInfo.nickname());
        metadata.setUsername(suggestInitialUsername(userInfo, null));
        metadata.setProfileImageUrl(userInfo.profileImageUrl());
        metadata.setProvider(provider.name());
        metadata.setProviderUserId(userInfo.providerUserId());
        return metadata;
    }

    private static class SignupSessionMetadata {
        private String email;
        private String provider;
        private String providerUserId;
        private String nickname;
        private String username;
        private String profileImageUrl;
        private String regionCode;
        private Boolean marketingOptIn;
        private Boolean hasPet;
        private java.util.List<String> consents = new java.util.ArrayList<>();
        private PetMetadata pet;

        public SignupSessionMetadata() {}

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getProvider() {
            return provider;
        }

        public void setProvider(String provider) {
            this.provider = provider;
        }

        public String getProviderUserId() {
            return providerUserId;
        }

        public void setProviderUserId(String providerUserId) {
            this.providerUserId = providerUserId;
        }

        public String getNickname() {
            return nickname;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }

        public String getRegionCode() {
            return regionCode;
        }

        public void setRegionCode(String regionCode) {
            this.regionCode = regionCode;
        }

        public Boolean getMarketingOptIn() {
            return marketingOptIn;
        }

        public void setMarketingOptIn(Boolean marketingOptIn) {
            this.marketingOptIn = marketingOptIn;
        }

        public Boolean getHasPet() {
            return hasPet;
        }

        public void setHasPet(Boolean hasPet) {
            this.hasPet = hasPet;
        }

        public java.util.List<String> getConsents() {
            return consents;
        }

        public void setConsents(java.util.List<String> consents) {
            this.consents = consents;
        }

        public PetMetadata getPet() {
            return pet;
        }

        public void setPet(PetMetadata pet) {
            this.pet = pet;
        }
    }

    private static class PetMetadata {
        private String dogRegNo;
        private String rfidCd;
        private String ownerNm;
        private String ownerBirth;
        private String name;
        private String breed;
        private String birthDate;
        private String gender;
        private Boolean neutered;
        private String photoUrl;
        private Double weightKg;
        private Boolean vaccinationComplete;
        private Boolean walkSafetyChecked;

        public PetMetadata() {}

        public String getDogRegNo() {
            return dogRegNo;
        }

        public void setDogRegNo(String dogRegNo) {
            this.dogRegNo = dogRegNo;
        }

        public String getRfidCd() {
            return rfidCd;
        }

        public void setRfidCd(String rfidCd) {
            this.rfidCd = rfidCd;
        }

        public String getOwnerNm() {
            return ownerNm;
        }

        public void setOwnerNm(String ownerNm) {
            this.ownerNm = ownerNm;
        }

        public String getOwnerBirth() {
            return ownerBirth;
        }

        public void setOwnerBirth(String ownerBirth) {
            this.ownerBirth = ownerBirth;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getBreed() {
            return breed;
        }

        public void setBreed(String breed) {
            this.breed = breed;
        }

        public String getBirthDate() {
            return birthDate;
        }

        public void setBirthDate(String birthDate) {
            this.birthDate = birthDate;
        }

        public String getGender() {
            return gender;
        }

        public void setGender(String gender) {
            this.gender = gender;
        }

        public Boolean getNeutered() {
            return neutered;
        }

        public void setNeutered(Boolean neutered) {
            this.neutered = neutered;
        }

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }

        public Double getWeightKg() {
            return weightKg;
        }

        public void setWeightKg(Double weightKg) {
            this.weightKg = weightKg;
        }

        public Boolean getVaccinationComplete() {
            return vaccinationComplete;
        }

        public void setVaccinationComplete(Boolean vaccinationComplete) {
            this.vaccinationComplete = vaccinationComplete;
        }

        public Boolean getWalkSafetyChecked() {
            return walkSafetyChecked;
        }

        public void setWalkSafetyChecked(Boolean walkSafetyChecked) {
            this.walkSafetyChecked = walkSafetyChecked;
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
