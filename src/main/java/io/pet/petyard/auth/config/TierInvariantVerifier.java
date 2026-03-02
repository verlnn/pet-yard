package io.pet.petyard.auth.config;

import io.pet.petyard.auth.domain.UserTier;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class TierInvariantVerifier implements ApplicationRunner {

    @Override
    public void run(ApplicationArguments args) {
        boolean tier1IncludesTier0 = UserTier.TIER_1.permissions().containsAll(UserTier.TIER_0.permissions());
        boolean tier2IncludesTier1 = UserTier.TIER_2.permissions().containsAll(UserTier.TIER_1.permissions());

        if (!tier1IncludesTier0 || !tier2IncludesTier1) {
            throw new IllegalStateException("Tier permission inclusion invariant violated");
        }
    }
}
