# DB Schema (Auth Tier0)

## 개요
- 스키마: `auth`
- Tier/Permission 정책 SSOT는 코드(`UserTier#permissions()`)에 있다.
- DB의 `auth.tiers`는 표시/참조용 메타데이터만 담당한다.

## 테이블 요약

### auth.tiers
- Tier 메타(표시/참조)용 테이블
- `tier_cd`는 코드 enum(`UserTier`)과 동일 문자열을 유지해야 한다.
- enum 추가 시:
  1) 코드 enum 추가
  2) seed upsert 추가

### auth.users
- 이메일 기반 회원 계정
- `tier`는 `auth.tiers(tier_cd)` FK (권한 정책은 코드 SSOT)
- `status`는 CHECK 제약으로 제한
- 확장 컬럼: `phone`, `display_name`, `deleted_at`

### auth.email_verifications
- 이메일 OTP 인증 기록
- `code_hash`만 저장 (평문 금지)
- 최신 미검증 코드 조회용 인덱스 포함

### auth.refresh_tokens
- 리프레시 토큰 저장
- `token_hash`만 저장 (평문 금지)
- 회전(rotation) 정책 가정 (기존 토큰 revoke 후 신규 발급)

## 컬럼 의미 요약
- `created_at`, `updated_at`는 모두 `timestamptz(UTC)`
- `updated_at`은 트리거로 자동 갱신
- `deleted_at`은 soft delete 확장 대비

## 마이그레이션 운영 원칙 (Flyway 기준)
- 파일명: `V###__description.sql`
- 예: `V001__init_tier0.sql`
- 신규 변경은 반드시 새로운 버전 파일로 추가

