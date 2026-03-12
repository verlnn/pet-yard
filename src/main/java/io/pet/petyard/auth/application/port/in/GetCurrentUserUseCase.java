package io.pet.petyard.auth.application.port.in;

import io.pet.petyard.auth.domain.UserTier;

import java.util.Set;

public interface GetCurrentUserUseCase {
    CurrentUserResult getCurrentUser(CurrentUserQuery query);

    record CurrentUserQuery(long userId, UserTier tier) {
    }

    record CurrentUserResult(long userId, String tier, Set<String> permissions) {
    }
}
