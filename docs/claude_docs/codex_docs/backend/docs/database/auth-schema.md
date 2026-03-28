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
- 공개 사용자 ID `username` 포함
- 상태: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `DELETED`
- `username` 규칙: `^(?!\\.)(?!.*\\.\\.)(?!.*\\.$)[a-z0-9._]{1,30}$`
- 로그인 식별자와 분리된 공개 식별자이며, 프로필 URL/멘션/검색 확장을 위한 기준 컬럼

### auth.email_verifications
- OTP 인증 기록 (평문 저장 금지)
- `attempt_count`로 시도 제한 관리

### auth.refresh_tokens
- refresh token 해시 저장
- 회전 및 폐기 지원

## Indexes & Constraints
- 이메일/전화번호 유니크
- `username` 유니크 인덱스
- `username` check constraint
- `email_verifications` 최신 미검증 조회 인덱스
- `refresh_tokens` 활성 토큰 인덱스

## Triggers
- `auth.touch_updated_at()` 함수로 `updated_at` 자동 갱신

## Username Migration Notes

- `V41__auth_users_username_column.sql`
  - nullable `username` 추가
  - 패턴 check constraint 추가
  - partial unique index 추가
- `V42__auth_users_username_backfill.sql`
  - 기존 회원을 `user.<id>` 형식으로 백필
  - `username not null` 전환

이 전략을 사용한 이유:

- 기존 운영 데이터가 있는 상태에서도 안전하게 컬럼을 추가할 수 있음
- 백필 전에 즉시 not null을 걸지 않아 마이그레이션 실패 가능성을 낮춤
- 백필 후에는 신규/기존 사용자 모두 동일한 제약을 갖게 됨
