package io.pet.petyard.auth.web;

import io.pet.petyard.auth.domain.UserTier;

import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class AuthUserStore {

    private final Map<Long, UserTier> users = Map.of(
        1L, UserTier.TIER_0,
        2L, UserTier.TIER_1,
        3L, UserTier.TIER_2
    );

    public Optional<UserTier> findTier(long userId) {
        return Optional.ofNullable(users.get(userId));
    }
}
