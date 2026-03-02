package io.pet.petyard.auth.domain;

/**
 * Permission은 행동 단위 권한을 나타낸다. 네이밍은 DOMAIN_ACTION을 사용한다.
 *
 * 규칙:
 * - 도메인 접두어는 API/가드 체크의 안정성을 위해 필수.
 * - ACTION은 READ, CREATE, UPDATE_OWN, APPLY, CHAT 같은 동사/동사구.
 * - 권한은 최소화하고, 새로운 행동을 보호해야 할 때만 추가한다.
 */
public enum Permission {
    // FEED
    FEED_READ,
    FEED_CREATE,

    // KNOWLEDGE
    KNOWLEDGE_READ,

    // WALK
    WALK_POST_READ,
    WALK_POST_CREATE,
    WALK_RECRUIT_READ,
    WALK_APPLY,
    WALK_MATCH,
    WALK_CHAT,

    // BOARDING
    BOARDING_APPLY,

    // PET_PROFILE
    PET_PROFILE_CREATE,

    // MODERATION
    MODERATION_REPORT,
    MODERATION_BLOCK
}
