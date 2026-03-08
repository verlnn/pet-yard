# Implementation Audit (2026-03-09)

## Existing Features

### Backend (Auth Tier0)
- API endpoints: `POST /api/auth/signup`, `POST /api/auth/verify-email`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Core auth logic in `AuthService` (signup/verify/login/refresh/logout).
- JWT access token + refresh token rotation (`JwtTokenProvider`).
- Security filter chain with JWT filter and common 401/403 response writer.
- Domain enums: `UserTier`, `Permission`, `AccountStatus`.
- JPA entities + repositories: `User`, `EmailVerification`, `RefreshToken`.
- Basic permission guard aspect: `@RequirePermission` + `RequirePermissionAspect`.

### Backend Tests
- Tier0 integration tests for signup/verify/login/refresh/me.
- Auth guard integration tests for tier-based access control.
- Unit test for `UserTier` permission mapping.

### Database
- PostgreSQL DDL in `db/schema/001_init_tier0.sql` (schemas, tables, indices, triggers, comments).
- Migration policy notes in `db/schema/README.md`.

### Frontend
- App Router routes for `/login`, `/signup`, `/verify` with a shared `AuthPage` UI.
- Auth UI components and hooks under `web/src/features/auth`.
- Next.js `middleware.ts` + `(app)/layout.tsx` guard for protected routes.
- API client scaffold for auth endpoints.

### Docs
- Existing docs: `docs/auth-tier0.md`, `docs/auth-permissions.md`, `docs/auth-guard.md`, `docs/user-tier.md`.

## Missing / Incomplete

### Architecture
- Backend auth does not follow Hexagonal structure; service directly depends on JPA repositories.
- Inbound/outbound ports and application services are missing.

### Backend
- No explicit domain models for auth aggregate outside JPA entities.
- Error response standardization exists but lacks full coverage for validation + domain errors.
- Logout/refresh handling lacks explicit token reuse detection policy docs.
- No Flyway integration; DB is currently H2 with `ddl-auto: update`.
- PostgreSQL driver missing from dependencies.

### Frontend
- Auth UI is SCSS-based; requirement mandates Tailwind-based components.
- Auth flow lacks `next` redirect handling and server-side token validation.
- Auth API client has TODOs for resend and consistent error mapping.
- Guard relies on access token cookie only; no refresh logic.

### Testing
- Missing dedicated tests for logout revocation reuse and invalid OTP limits.
- No Testcontainers/PostgreSQL integration.
- Frontend auth tests not present (Vitest/Playwright infra exists).

### Docs
- Required auth architecture/API/security/testing docs missing.
- Required frontend and DB schema/migration docs missing.
- No global testing strategy doc or work log.

## Improvements Needed

1. Refactor backend auth into Hexagonal architecture (ports/adapters/use-cases), keeping existing behavior.
2. Add Flyway migrations and PostgreSQL support; align with existing DDL.
3. Expand auth tests (logout reuse, OTP invalid attempts, negative cases).
4. Update frontend auth UI to Tailwind-based component structure; add guard improvements.
5. Add required documentation set and keep existing docs updated.

## Planned Work (Priority Order)

1. Add/refresh `docs/implementation-audit.md` (this document).
2. Introduce Hexagonal structure for auth (ports, use-cases, adapters) and refactor service/controller accordingly.
3. Add backend tests for missing scenarios and error coverage.
4. Add Flyway + PostgreSQL driver + migration layout; document DB strategy.
5. Refactor frontend auth UI to Tailwind-based components and improve guard/redirect.
6. Write required docs and work log.

