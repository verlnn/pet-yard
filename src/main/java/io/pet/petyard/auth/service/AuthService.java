package io.pet.petyard.auth.service;

import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.jpa.EmailVerification;
import io.pet.petyard.auth.jpa.EmailVerificationRepository;
import io.pet.petyard.auth.jpa.RefreshToken;
import io.pet.petyard.auth.jpa.RefreshTokenRepository;
import io.pet.petyard.auth.jpa.User;
import io.pet.petyard.auth.jpa.UserRepository;
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
public class AuthService {

    private static final int OTP_TTL_MINUTES = 10;
    private static final int OTP_MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final EmailVerificationRepository verificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final Clock clock;
    private final OtpGenerator otpGenerator;

    public AuthService(UserRepository userRepository,
                       EmailVerificationRepository verificationRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       Clock clock,
                       OtpGenerator otpGenerator) {
        this.userRepository = userRepository;
        this.verificationRepository = verificationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.clock = clock;
        this.otpGenerator = otpGenerator;
    }

    @Transactional
    public SignupResult signup(String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(ErrorCode.EMAIL_ALREADY_REGISTERED);
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(email, passwordHash, UserTier.TIER_0, AccountStatus.PENDING_VERIFICATION);
        userRepository.save(user);

        String code = otpGenerator.generate(email);
        String codeHash = passwordEncoder.encode(code);
        Instant now = clock.instant();
        Instant expiresAt = now.plusSeconds(OTP_TTL_MINUTES * 60L);

        EmailVerification verification = new EmailVerification(user.getId(), email, codeHash, expiresAt, now);
        verificationRepository.save(verification);

        // TODO: 실제 이메일 발송 연동
        log.info("[OTP] {} -> {}", email, code);

        return new SignupResult(user.getId(), email);
    }

    @Transactional(noRollbackFor = {ApiException.class, AccessDeniedException.class})
    public void verifyEmail(String email, String code) {
        EmailVerification verification = verificationRepository
            .findTopByEmailAndVerifiedAtIsNullOrderByCreatedAtDesc(email)
            .orElseThrow(() -> new ApiException(ErrorCode.VERIFICATION_CODE_NOT_FOUND));

        Instant now = clock.instant();
        if (verification.isExpired(now)) {
            throw new ApiException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }
        if (verification.getAttemptCount() >= OTP_MAX_ATTEMPTS) {
            throw new AccessDeniedException(ErrorCode.VERIFICATION_ATTEMPTS_EXCEEDED.message());
        }

        boolean matches = passwordEncoder.matches(code, verification.getCodeHash());
        if (!matches) {
            verification.incrementAttempt();
            throw new ApiException(ErrorCode.INVALID_VERIFICATION_CODE);
        }

        verification.markVerified(now);

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        user.setStatus(AccountStatus.ACTIVE);
    }

    @Transactional
    public TokenPair login(String email, String password) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(ErrorCode.INVALID_CREDENTIALS.message()));

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AccessDeniedException(ErrorCode.ACCOUNT_NOT_ACTIVE.message());
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.INVALID_CREDENTIALS.message());
        }

        String accessToken = tokenProvider.createAccessToken(user.getId(), user.getTier());
        String refreshRaw = tokenProvider.createRefreshToken();
        String refreshHash = tokenProvider.hashRefreshToken(refreshRaw);

        RefreshToken refreshToken = new RefreshToken(user.getId(), refreshHash, tokenProvider.refreshExpiry(), clock.instant());
        refreshTokenRepository.save(refreshToken);

        user.setLastLoginAt(clock.instant());

        return new TokenPair(accessToken, refreshRaw);
    }

    @Transactional
    public TokenPair refresh(String refreshTokenRaw) {
        String hash = tokenProvider.hashRefreshToken(refreshTokenRaw);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(ErrorCode.REFRESH_TOKEN_NOT_FOUND.message()));

        Instant now = clock.instant();
        if (stored.isRevoked() || stored.isExpired(now)) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.REFRESH_TOKEN_INVALID.message());
        }

        stored.revoke(now);

        User user = userRepository.findById(stored.getUserId())
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        String newAccess = tokenProvider.createAccessToken(user.getId(), user.getTier());
        String newRefreshRaw = tokenProvider.createRefreshToken();
        String newRefreshHash = tokenProvider.hashRefreshToken(newRefreshRaw);

        RefreshToken rotated = new RefreshToken(user.getId(), newRefreshHash, tokenProvider.refreshExpiry(), now);
        refreshTokenRepository.save(rotated);

        return new TokenPair(newAccess, newRefreshRaw);
    }

    @Transactional
    public void logout(String refreshTokenRaw) {
        String hash = tokenProvider.hashRefreshToken(refreshTokenRaw);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException(ErrorCode.REFRESH_TOKEN_NOT_FOUND.message()));

        if (!stored.isRevoked()) {
            stored.revoke(clock.instant());
        }
    }

    public record SignupResult(long userId, String email) {
    }

    public record TokenPair(String accessToken, String refreshToken) {
    }
}
