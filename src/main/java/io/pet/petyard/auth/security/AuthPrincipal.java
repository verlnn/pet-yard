package io.pet.petyard.auth.security;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.domain.UserTier;

import java.util.EnumSet;

/**
 * SecurityContext에 담기는 현재 사용자 정보.
 * 권한은 tier.permissions()로 서버에서 산출한다.
 */
public record AuthPrincipal(
    long userId,
    UserTier tier
) {

    public EnumSet<Permission> permissions() {
        return EnumSet.copyOf(tier.permissions());
    }
}
