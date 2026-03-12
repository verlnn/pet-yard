# Auth Testing

## Coverage
- 회원가입/이메일 인증/로그인 성공 플로우
- 인증 전 로그인 차단
- refresh token 회전
- 로그아웃 후 refresh 재사용 금지
- OTP 시도 제한
- 보호 API 401/403 검증

## Test Suites
- `AuthTier0IntegrationTest`
- `AuthGuardIntegrationTest`
- `UserTierPermissionsTest`

## Run
```
./gradlew test
```

## Notes
- 테스트는 H2 인메모리 DB를 사용한다.
- Flyway는 테스트 프로파일에서 비활성화되어 있다.
