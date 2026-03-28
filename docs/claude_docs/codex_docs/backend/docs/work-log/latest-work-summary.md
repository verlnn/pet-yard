# Latest Work Summary (2026-03-16)

## Confirmed Existing Features
- Auth Tier0 API endpoints (signup/verify/login/refresh/logout/me)
- JWT 기반 인증 필터 및 보안 설정
- 권한 가드(`@RequirePermission`) 구조
- App Router 보호 라우트 가드(`middleware.ts`, `(app)/layout.tsx`)

## New Features
- OAuth 온보딩 플로우 도입(카카오 start/callback + signup session)
- 온보딩 도메인/엔티티/마이그레이션 추가
- 온보딩 프론트 화면(start/profile/consents/pet/complete)
- 약관/프로필/반려동물 기본 모델 추가

## Enhanced Features
- AuthIdentity 기반 이메일/소셜 계정 연결 확장
- 로그인/회원가입 화면 분리 및 톤 정렬

## Tests Added/Updated
- Backend: 카카오 온보딩 통합 테스트(콜백/약관/완료/닉네임 중복)

## Docs Added/Updated
- `docs/auth-signup-flow.md`
- `docs/api/auth-api-spec.md`
- `docs/domain/auth-onboarding-design.md`
- `docs/frontend/signup-ui-flow.md`
- `docs/db/auth-onboarding-schema.md`
- 기존 문서 보강(auth-architecture, migration-guide 등)

## Remaining TODO
- Kakao OAuth 실제 연동 환경 검증
- 온보딩 UX 세부 다듬기(지역 선택 UI 고도화)

## Commit Summary
- feat: 카카오 OAuth/온보딩 도입
- feat: 온보딩 프론트 화면 추가
- docs: 온보딩/도메인/API/DB 문서 추가
