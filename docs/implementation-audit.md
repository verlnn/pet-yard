# Implementation Audit (2026-03-12)

## Existing Features

### Backend (Auth Tier0)
- API endpoints: `POST /api/auth/signup`, `POST /api/auth/verify-email`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Hexagonal 구조 적용: ports/use-cases/adapters 분리.
- JWT access token + refresh token rotation (`JwtTokenProvider`).
- Security filter chain with JWT filter and common 401/403 response writer.
- Domain enums: `UserTier`, `Permission`, `AccountStatus`.
- Domain model: `User`, `EmailVerification`, `RefreshToken` (JPA 기반).
- Permission guard: `@RequirePermission` + `RequirePermissionAspect`.

### Backend Tests
- Tier0 통합 테스트: signup/verify/login/refresh/me.
- 로그아웃 후 refresh 재사용 금지 테스트.
- OTP 시도 제한 테스트.
- Auth guard 통합 테스트 + `UserTier` 권한 매핑 단위 테스트.

### Database
- Flyway migration: `V1__init_auth_tier0.sql`.
- PostgreSQL 설정 및 드라이버 추가.

### Frontend
- App Router routes for `/login`, `/signup`, `/verify` with shared `AuthPage`.
- Tailwind 기반 auth UI 컴포넌트.
- 로그인 후 `next` 파라미터 리다이렉트 처리.
- Guard: `middleware.ts` + `(app)/layout.tsx`.

### Docs
- 기존 문서 + auth/DB/frontend/testing 문서 추가.

## Missing / Incomplete

### Backend
- 도메인 모델의 JPA 의존 제거(순수 도메인 모델 분리) 필요.
- refresh token 재사용 탐지 정책/알림 로직 고도화 여지.

### Frontend
- 재전송(resend) API 연동 미완료.
- access token 서버 검증 로직 미구현.
- auth 관련 프론트 테스트 부재.

### Testing
- Testcontainers/PostgreSQL 통합 테스트 미도입.
- 프론트 컴포넌트/라우팅 테스트 미도입.

## Improvements Completed
1. Auth 헥사고날 구조 리팩터링 완료.
2. Flyway + PostgreSQL 마이그레이션 구조 도입.
3. 로그아웃/OTP 제한 테스트 보강.
4. Tailwind 기반 auth UI 구조 정리.
5. 문서 세트 작성 시작.

## Next Focus
1. 프론트 인증 테스트 도입 (Vitest/Playwright).
2. resend API 및 서버 토큰 검증 로직 확장.
3. Testcontainers 기반 DB 통합 테스트 도입.
