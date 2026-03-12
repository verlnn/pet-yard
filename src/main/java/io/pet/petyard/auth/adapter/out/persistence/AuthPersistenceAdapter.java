package io.pet.petyard.auth.adapter.out.persistence;

import io.pet.petyard.auth.application.port.out.LoadLatestPendingEmailVerificationPort;
import io.pet.petyard.auth.application.port.out.LoadRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.RevokeRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.SaveEmailVerificationPort;
import io.pet.petyard.auth.application.port.out.SaveRefreshTokenPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.model.EmailVerification;
import io.pet.petyard.auth.domain.model.RefreshToken;
import io.pet.petyard.auth.domain.model.User;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class AuthPersistenceAdapter implements LoadUserPort, SaveUserPort, SaveEmailVerificationPort,
    LoadLatestPendingEmailVerificationPort, SaveRefreshTokenPort, LoadRefreshTokenPort, RevokeRefreshTokenPort {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthPersistenceAdapter(UserRepository userRepository,
                                  EmailVerificationRepository emailVerificationRepository,
                                  RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public EmailVerification save(EmailVerification verification) {
        return emailVerificationRepository.save(verification);
    }

    @Override
    public Optional<EmailVerification> loadLatestPendingByEmail(String email) {
        return emailVerificationRepository.findTopByEmailAndVerifiedAtIsNullOrderByCreatedAtDesc(email);
    }

    @Override
    public RefreshToken save(RefreshToken token) {
        return refreshTokenRepository.save(token);
    }

    @Override
    public Optional<RefreshToken> loadByTokenHash(String tokenHash) {
        return refreshTokenRepository.findByTokenHash(tokenHash);
    }

    @Override
    public void revoke(RefreshToken token) {
        refreshTokenRepository.save(token);
    }
}
