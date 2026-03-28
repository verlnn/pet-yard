# Testing Strategy

## Backend
- 통합 테스트 중심으로 인증 플로우 검증
- 주요 시나리오: signup/verify/login/refresh/logout/me
- 소셜 온보딩: kakao start/callback, 프로필/약관/완료
- 권한/보호 API 401/403 검증
- 향후 Testcontainers(PostgreSQL) 도입 고려

## Frontend
- Vitest 기반 컴포넌트 테스트 시작 (AuthTabs/LoginForm)
- Playwright로 로그인/회원가입/보호 라우트 플로우 E2E 검증 고려
- 단계적으로 인증 플로우 테스트를 확장

## Commands
```
./gradlew test
```
