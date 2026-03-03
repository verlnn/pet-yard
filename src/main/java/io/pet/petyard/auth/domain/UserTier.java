package io.pet.petyard.auth.domain;

import java.util.Arrays;
import java.util.Comparator;
import java.util.EnumSet;

/**
 * UserTier는 역할/등급을 나타낸다. 각 티어는 최소한의 직접 권한 집합에 매핑된다.
 * 상위 티어는 하위 티어의 권한을 자동으로 포함한다 (SSOT: user-tier.md).
 */
public enum UserTier {
    TIER_0(0,
        Permission.FEED_READ,
        Permission.KNOWLEDGE_READ
    ),
    TIER_1(1,
        Permission.FEED_CREATE,
        Permission.WALK_READ,
        Permission.WALK_CREATE,
        Permission.WALK_RECRUIT_READ
    ),
    TIER_2(2,
        Permission.WALK_APPLY,
        Permission.WALK_MATCH,
        Permission.WALK_CHAT,
        Permission.BOARDING_APPLY
    );

    private final int level;
    private final EnumSet<Permission> directPermissions;
    private EnumSet<Permission> cumulativePermissions;

    UserTier(int level, Permission... directPermissions) {
        this.level = level;
        this.directPermissions = directPermissions.length == 0
            ? EnumSet.noneOf(Permission.class)
            : EnumSet.copyOf(Arrays.asList(directPermissions));
    }

    static {
        UserTier[] tiers = values().clone();
        Arrays.sort(tiers, Comparator.comparingInt(UserTier::level));
        EnumSet<Permission> acc = EnumSet.noneOf(Permission.class);
        for (UserTier tier : tiers) {
            acc.addAll(tier.directPermissions);
            tier.cumulativePermissions = EnumSet.copyOf(acc);
        }
    }

    /**
     * 해당 티어의 권한 스냅샷을 불변 집합으로 반환한다.
     */
    public EnumSet<Permission> permissions() {
        return EnumSet.copyOf(cumulativePermissions);
    }

    public int level() {
        return level;
    }

    EnumSet<Permission> directPermissions() {
        return EnumSet.copyOf(directPermissions);
    }
}
