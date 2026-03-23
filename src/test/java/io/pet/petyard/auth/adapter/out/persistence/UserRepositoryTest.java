package io.pet.petyard.auth.adapter.out.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUsernameReturnsUserWhenUsernameExists() {
        userRepository.saveAndFlush(new User("owner@petyard.com", "hash", "owner.test", UserTier.TIER_1, AccountStatus.ACTIVE));

        assertThat(userRepository.findByUsername("owner.test")).isPresent();
    }

    @Test
    void usernameCheckConstraintRejectsInvalidPattern() {
        assertThatThrownBy(() -> userRepository.saveAndFlush(
            new User("invalid@petyard.com", "hash", "invalid..name", UserTier.TIER_1, AccountStatus.ACTIVE)
        ))
            .isInstanceOfAny(ConstraintViolationException.class, DataIntegrityViolationException.class);
    }

    @Test
    void usernameUniqueConstraintRejectsDuplicateValue() {
        userRepository.saveAndFlush(new User("first@petyard.com", "hash", "owner.test", UserTier.TIER_1, AccountStatus.ACTIVE));

        assertThatThrownBy(() -> userRepository.saveAndFlush(
            new User("second@petyard.com", "hash", "owner.test", UserTier.TIER_1, AccountStatus.ACTIVE)
        ))
            .isInstanceOf(DataIntegrityViolationException.class);
    }
}
