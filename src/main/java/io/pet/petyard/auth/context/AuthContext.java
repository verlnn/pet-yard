package io.pet.petyard.auth.context;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.domain.UserTier;

import java.util.EnumSet;

/**
 * 요청 스코프에서 접근 가능한 현재 사용자 컨텍스트.
 * 권한은 반드시 tier.permissions()에서 서버가 계산한 결과를 사용한다.
 */
public final class AuthContext {

    public static final String REQUEST_ATTRIBUTE = "AUTH_CONTEXT";

    private final long userId;
    private final UserTier tier;
    private final EnumSet<Permission> permissions;

    private AuthContext(long userId, UserTier tier) {
        this.userId = userId;
        this.tier = tier;
        this.permissions = tier.permissions();
    }

    public static AuthContext of(long userId, UserTier tier) {
        return new AuthContext(userId, tier);
    }

    public long userId() {
        return userId;
    }

    public UserTier tier() {
        return tier;
    }

    public EnumSet<Permission> permissions() {
        return EnumSet.copyOf(permissions);
    }
}
