# Auth Security

## JWT
- Access token에는 `userId`, `tier`만 포함한다.
- Permissions는 토큰에 넣지 않고, 서버에서 `UserTier#permissions()`로 계산한다.
- `JwtAuthenticationFilter`가 Authorization 헤더의 Bearer 토큰을 검증하고 `AuthPrincipal`을 생성한다.

## Refresh Token
- Refresh token은 평문 저장 금지: 서버는 해시를 저장한다.
- Refresh token은 회전 방식으로 동작한다.
- 로그아웃 시 refresh token은 즉시 폐기한다.

## Security Configuration
- `/api/auth/**`는 permitAll
- `/api/**`는 인증 필요
- 401/403 응답은 공통 `ErrorResponse`로 내려간다.

## Permission Guard
- `@RequirePermission` + `RequirePermissionAspect`로 권한 체크
- 모드는 `ALL`/`ANY` 지원
- 권한 기준은 `UserTier#permissions()`가 SSOT
