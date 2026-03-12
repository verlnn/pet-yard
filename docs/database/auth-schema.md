# Auth Schema (PostgreSQL)

Migration Source: `src/main/resources/db/migration/V1__init_auth_tier0.sql`

## Schemas
- `auth`: 인증 관련 테이블
- `pet`, `core`: 확장 예정

## Tables

### auth.tiers
- Tier 메타 데이터(표시/참조용)
- 권한 SSOT는 코드의 `UserTier#permissions()`

### auth.users
- 이메일/비밀번호 해시/등급/상태 관리
- 상태: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `DELETED`

### auth.email_verifications
- OTP 인증 기록 (평문 저장 금지)
- `attempt_count`로 시도 제한 관리

### auth.refresh_tokens
- refresh token 해시 저장
- 회전 및 폐기 지원

## Indexes & Constraints
- 이메일/전화번호 유니크
- `email_verifications` 최신 미검증 조회 인덱스
- `refresh_tokens` 활성 토큰 인덱스

## Triggers
- `auth.touch_updated_at()` 함수로 `updated_at` 자동 갱신
