package io.pet.petyard.auth.config;

import io.pet.petyard.auth.adapter.out.persistence.UserRepository;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.user.adapter.out.persistence.UserProfileRepository;
import io.pet.petyard.user.domain.model.UserProfile;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("local")
public class LocalTestAccountSeeder implements ApplicationRunner {

    private static final String TEST_ACCOUNT_PASSWORD = "petyard123!";

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public LocalTestAccountSeeder(UserRepository userRepository,
                                  UserProfileRepository userProfileRepository,
                                  PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(org.springframework.boot.ApplicationArguments args) {
        ensureTestAccount("feed-test-1@petyard.local", "테스트계정01");
        ensureTestAccount("feed-test-2@petyard.local", "테스트계정02");
        ensureTestAccount("feed-test-3@petyard.local", "테스트계정03");
    }

    private void ensureTestAccount(String email, String nickname) {
        User user = userRepository.findByEmail(email)
            .map(existing -> {
                existing.changePasswordHash(passwordEncoder.encode(TEST_ACCOUNT_PASSWORD));
                existing.setStatus(AccountStatus.ACTIVE);
                existing.setTier(UserTier.TIER_1);
                return existing;
            })
            .orElseGet(() -> new User(
                email,
                passwordEncoder.encode(TEST_ACCOUNT_PASSWORD),
                UserTier.TIER_1,
                AccountStatus.ACTIVE
            ));

        User savedUser = userRepository.save(user);

        userProfileRepository.findByUserId(savedUser.getId())
            .orElseGet(() -> userProfileRepository.save(new UserProfile(
                savedUser.getId(),
                nickname,
                null,
                null,
                false,
                true
            )));
    }
}
