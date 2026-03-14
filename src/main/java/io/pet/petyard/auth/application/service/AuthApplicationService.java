package io.pet.petyard.auth.application.service;

import io.pet.petyard.auth.application.port.in.AuthTokens;
import io.pet.petyard.auth.application.port.in.ExtendEmailVerificationUseCase;
import io.pet.petyard.auth.application.port.in.GetCurrentUserUseCase;
import io.pet.petyard.auth.application.port.in.LoginUseCase;
import io.pet.petyard.auth.application.port.in.LogoutUseCase;
import io.pet.petyard.auth.application.port.in.RefreshTokenUseCase;
import io.pet.petyard.auth.application.port.in.ResendEmailVerificationUseCase;
import io.pet.petyard.auth.application.port.in.SignUpUseCase;
import io.pet.petyard.auth.application.port.in.VerifyEmailUseCase;
import io.pet.petyard.auth.application.port.out.LoadLatestPendingEmailVerificationPort;
import io.pet.petyard.auth.application.port.out.LoadRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.EmailSender;
import io.pet.petyard.auth.application.port.out.RevokeRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.SaveEmailVerificationPort;
import io.pet.petyard.auth.application.port.out.SaveRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.EmailVerification;
import io.pet.petyard.auth.domain.model.RefreshToken;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;

import java.time.Clock;
import java.time.Instant;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthApplicationService implements SignUpUseCase, VerifyEmailUseCase, ExtendEmailVerificationUseCase,
    ResendEmailVerificationUseCase, LoginUseCase, RefreshTokenUseCase, LogoutUseCase, GetCurrentUserUseCase {

    private static final int OTP_TTL_MINUTES = 3;
    private static final int OTP_MAX_ATTEMPTS = 5;
    private static final int OTP_EXTEND_SECONDS = 60;
    private static final int OTP_EXTEND_WINDOW_MILLIS = 1000;
    private static final int OTP_EXTEND_MAX_PER_WINDOW = 2;
    private static final int OTP_MAX_EXTENSION_MINUTES = 15;

    private final LoadUserPort loadUserPort;
    private final SaveUserPort saveUserPort;
    private final SaveEmailVerificationPort saveEmailVerificationPort;
    private final LoadLatestPendingEmailVerificationPort loadLatestPendingEmailVerificationPort;
    private final SaveRefreshTokenPort saveRefreshTokenPort;
    private final LoadRefreshTokenPort loadRefreshTokenPort;
    private final RevokeRefreshTokenPort revokeRefreshTokenPort;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final Clock clock;
    private final OtpGenerator otpGenerator;

    public AuthApplicationService(LoadUserPort loadUserPort,
                                  SaveUserPort saveUserPort,
                                  SaveEmailVerificationPort saveEmailVerificationPort,
                                  LoadLatestPendingEmailVerificationPort loadLatestPendingEmailVerificationPort,
                                  SaveRefreshTokenPort saveRefreshTokenPort,
                                  LoadRefreshTokenPort loadRefreshTokenPort,
                                  RevokeRefreshTokenPort revokeRefreshTokenPort,
                                  EmailSender emailSender,
                                  PasswordEncoder passwordEncoder,
                                  JwtTokenProvider tokenProvider,
                                  Clock clock,
                                  OtpGenerator otpGenerator) {
        this.loadUserPort = loadUserPort;
        this.saveUserPort = saveUserPort;
        this.saveEmailVerificationPort = saveEmailVerificationPort;
        this.loadLatestPendingEmailVerificationPort = loadLatestPendingEmailVerificationPort;
        this.saveRefreshTokenPort = saveRefreshTokenPort;
        this.loadRefreshTokenPort = loadRefreshTokenPort;
        this.revokeRefreshTokenPort = revokeRefreshTokenPort;
        this.emailSender = emailSender;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.clock = clock;
        this.otpGenerator = otpGenerator;
    }

    @Transactional
    @Override
    public SignupResult signup(SignUpCommand command) {
        if (loadUserPort.existsByEmail(command.email())) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_REGISTERED);
        }

        String passwordHash = passwordEncoder.encode(command.password());
        User user = new User(command.email(), passwordHash, UserTier.TIER_0, AccountStatus.PENDING_VERIFICATION);
        saveUserPort.save(user);

        String code = otpGenerator.generate(command.email());
        String codeHash = passwordEncoder.encode(code);
        Instant now = clock.instant();
        Instant expiresAt = now.plusSeconds(OTP_TTL_MINUTES * 60L);

        EmailVerification verification = new EmailVerification(user.getId(), command.email(), codeHash, expiresAt, now);
        saveEmailVerificationPort.save(verification);

        String subject = "[멍냥마당] 이메일 인증 코드";
        String body = String.format("인증 코드는 %s 입니다.%n유효 시간: %d분", code, OTP_TTL_MINUTES);
        emailSender.send(command.email(), subject, body);

        log.info("[OTP] {} -> {}", command.email(), code);

        return new SignupResult(user.getId(), command.email(), expiresAt);
    }

    @Transactional(noRollbackFor = {ApiException.class, AccessDeniedException.class})
    @Override
    public void verifyEmail(VerifyEmailCommand command) {
        EmailVerification verification = loadLatestPendingEmailVerificationPort
            .loadLatestPendingByEmail(command.email())
            .orElseThrow(() -> new ApiException(ErrorCode.VERIFICATION_CODE_NOT_FOUND));

        Instant now = clock.instant();
        if (verification.isExpired(now)) {
            throw new ApiException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }
        if (verification.getAttemptCount() >= OTP_MAX_ATTEMPTS) {
            throw new AccessDeniedException(ErrorCode.VERIFICATION_ATTEMPTS_EXCEEDED.message());
        }

        boolean matches = passwordEncoder.matches(command.code(), verification.getCodeHash());
        if (!matches) {
            verification.incrementAttempt();
            throw new ApiException(ErrorCode.INVALID_VERIFICATION_CODE);
        }

        verification.markVerified(now);

        User user = loadUserPort.findByEmail(command.email())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(AccountStatus.ACTIVE);
    }

    @Transactional
    @Override
    public ExtendResult extendEmail(ExtendCommand command) {
        EmailVerification verification = loadLatestPendingEmailVerificationPort
            .loadLatestPendingByEmail(command.email())
            .orElseThrow(() -> new ApiException(ErrorCode.VERIFICATION_CODE_NOT_FOUND));

        Instant now = clock.instant();
        if (verification.isExpired(now)) {
            throw new ApiException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }

        if (!verification.canExtend(now, OTP_EXTEND_WINDOW_MILLIS, OTP_EXTEND_MAX_PER_WINDOW)) {
            throw new ApiException(ErrorCode.VERIFICATION_EXTEND_RATE_LIMIT);
        }

        Instant maxExpiry = verification.getCreatedAt().plusSeconds(OTP_MAX_EXTENSION_MINUTES * 60L);
        Instant nextExpiry = verification.getExpiresAt().plusSeconds(OTP_EXTEND_SECONDS);
        if (nextExpiry.isAfter(maxExpiry)) {
            nextExpiry = maxExpiry;
        }
        verification.extendExpiryTo(nextExpiry);

        return new ExtendResult(verification.getExpiresAt());
    }

    @Transactional
    @Override
    public ResendResult resendEmail(ResendCommand command) {
        EmailVerification verification = loadLatestPendingEmailVerificationPort
            .loadLatestPendingByEmail(command.email())
            .orElseThrow(() -> new ApiException(ErrorCode.VERIFICATION_CODE_NOT_FOUND));

        Instant now = clock.instant();
        if (!verification.isExpired(now)) {
            throw new ApiException(ErrorCode.VERIFICATION_CODE_NOT_EXPIRED);
        }

        User user = loadUserPort.findByEmail(command.email())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        String code = otpGenerator.generate(command.email());
        String codeHash = passwordEncoder.encode(code);
        Instant expiresAt = now.plusSeconds(OTP_TTL_MINUTES * 60L);

        EmailVerification renewed = new EmailVerification(user.getId(), command.email(), codeHash, expiresAt, now);
        saveEmailVerificationPort.save(renewed);

        String subject = "[멍냥마당] 이메일 인증 코드";
        String body = String.format("인증 코드는 %s 입니다.%n유효 시간: %d분", code, OTP_TTL_MINUTES);
        emailSender.send(command.email(), subject, body);

        log.info("[OTP][RESEND] {} -> {}", command.email(), code);

        return new ResendResult(expiresAt);
    }

    @Transactional
    @Override
    public AuthTokens login(LoginCommand command) {
        User user = loadUserPort.findByEmail(command.email())
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(ErrorCode.INVALID_CREDENTIALS.message()));

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AccessDeniedException(ErrorCode.ACCOUNT_NOT_ACTIVE.message());
        }

        if (!passwordEncoder.matches(command.password(), user.getPasswordHash())) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.INVALID_CREDENTIALS.message());
        }

        String accessToken = tokenProvider.createAccessToken(user.getId(), user.getTier());
        String refreshRaw = tokenProvider.createRefreshToken();
        String refreshHash = tokenProvider.hashRefreshToken(refreshRaw);

        RefreshToken refreshToken = new RefreshToken(user.getId(), refreshHash, tokenProvider.refreshExpiry(), clock.instant());
        saveRefreshTokenPort.save(refreshToken);

        user.setLastLoginAt(clock.instant());

        return new AuthTokens(accessToken, refreshRaw);
    }

    @Transactional
    @Override
    public AuthTokens refresh(RefreshTokenCommand command) {
        String hash = tokenProvider.hashRefreshToken(command.refreshToken());
        RefreshToken stored = loadRefreshTokenPort.loadByTokenHash(hash)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(ErrorCode.REFRESH_TOKEN_NOT_FOUND.message()));

        Instant now = clock.instant();
        if (stored.isRevoked() || stored.isExpired(now)) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.REFRESH_TOKEN_INVALID.message());
        }

        stored.revoke(now);
        revokeRefreshTokenPort.revoke(stored);

        User user = loadUserPort.findById(stored.getUserId())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        String newAccess = tokenProvider.createAccessToken(user.getId(), user.getTier());
        String newRefreshRaw = tokenProvider.createRefreshToken();
        String newRefreshHash = tokenProvider.hashRefreshToken(newRefreshRaw);

        RefreshToken rotated = new RefreshToken(user.getId(), newRefreshHash, tokenProvider.refreshExpiry(), now);
        saveRefreshTokenPort.save(rotated);

        return new AuthTokens(newAccess, newRefreshRaw);
    }

    @Transactional
    @Override
    public void logout(LogoutCommand command) {
        String hash = tokenProvider.hashRefreshToken(command.refreshToken());
        RefreshToken stored = loadRefreshTokenPort.loadByTokenHash(hash)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(ErrorCode.REFRESH_TOKEN_NOT_FOUND.message()));

        if (!stored.isRevoked()) {
            stored.revoke(clock.instant());
            revokeRefreshTokenPort.revoke(stored);
        }
    }

    @Override
    public CurrentUserResult getCurrentUser(CurrentUserQuery query) {
        UserTier tier = query.tier();
        return new CurrentUserResult(query.userId(), tier.name(),
            tier.permissions().stream().map(Enum::name)
                .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new)));
    }
}
