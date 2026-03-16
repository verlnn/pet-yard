package io.pet.petyard.auth.domain;

public enum AccountStatus {
    PENDING_ONBOARDING,
    PENDING_VERIFICATION,
    ACTIVE,
    DORMANT,
    SUSPENDED,
    DELETED,
    WITHDRAWN
}
