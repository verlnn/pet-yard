# Auth Permissions

## Tier별 포함 권한 목록

Tier 0
- FEED_READ
- KNOWLEDGE_READ

Tier 1
- FEED_READ
- KNOWLEDGE_READ
- FEED_CREATE
- WALK_READ
- WALK_CREATE
- WALK_RECRUIT_READ

Tier 2
- FEED_READ
- KNOWLEDGE_READ
- FEED_CREATE
- WALK_READ
- WALK_CREATE
- WALK_RECRUIT_READ
- WALK_APPLY
- WALK_MATCH
- WALK_CHAT
- BOARDING_APPLY

## 권한 네이밍 규칙

- 형식: DOMAIN_ACTION
- DOMAIN은 기능 영역 고정 키워드 사용
- ACTION은 행동 단위로 분해한 동사 또는 동사구 사용
- 예시: FEED_READ, WALK_CREATE, WALK_APPLY, BOARDING_APPLY

도메인 키워드 목록
- FEED
- KNOWLEDGE
- WALK
- BOARDING
- PET_PROFILE
- MODERATION

## 추후 티어 상승/하향 정책 연결 위치

- 정책 조건은 `UserTier` 외부의 정책 모듈에서 결정한다.
- 예시 위치: `com.petyard.auth.policy` 패키지에 `TierPolicyService` 또는 `TierEligibilityPolicy` 추가.
- 정책 모듈은 사용자 상태(인증, 반려동물 인증, 신뢰 점수 등)를 평가해 목표 Tier를 결정하고, `UserTier`는 권한 집합 매핑만 담당한다.
