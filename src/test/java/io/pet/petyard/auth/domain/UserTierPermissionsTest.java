package io.pet.petyard.auth.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.EnumSet;

import org.junit.jupiter.api.Test;

class UserTierPermissionsTest {

    @Test
    void tierPermissionsAreMonotonic() {
        EnumSet<Permission> tier0 = UserTier.TIER_0.permissions();
        EnumSet<Permission> tier1 = UserTier.TIER_1.permissions();
        EnumSet<Permission> tier2 = UserTier.TIER_2.permissions();

        assertTrue(tier1.containsAll(tier0), "Tier1 should include Tier0 permissions");
        assertTrue(tier2.containsAll(tier1), "Tier2 should include Tier1 permissions");
    }

    @Test
    void tierPermissionsMatchSsot() {
        EnumSet<Permission> tier0Expected = EnumSet.of(
            Permission.FEED_READ,
            Permission.KNOWLEDGE_READ
        );
        EnumSet<Permission> tier1Expected = EnumSet.of(
            Permission.FEED_READ,
            Permission.KNOWLEDGE_READ,
            Permission.FEED_CREATE,
            Permission.WALK_POST_READ,
            Permission.WALK_POST_CREATE,
            Permission.WALK_RECRUIT_READ
        );
        EnumSet<Permission> tier2Expected = EnumSet.of(
            Permission.FEED_READ,
            Permission.KNOWLEDGE_READ,
            Permission.FEED_CREATE,
            Permission.WALK_POST_READ,
            Permission.WALK_POST_CREATE,
            Permission.WALK_RECRUIT_READ,
            Permission.WALK_APPLY,
            Permission.WALK_MATCH,
            Permission.WALK_CHAT,
            Permission.BOARDING_APPLY
        );

        assertEquals(tier0Expected, UserTier.TIER_0.permissions());
        assertEquals(tier1Expected, UserTier.TIER_1.permissions());
        assertEquals(tier2Expected, UserTier.TIER_2.permissions());
    }
}
