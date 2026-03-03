# Auth Tier0

## Tier0 의미

- 이메일 인증을 완료한 기본 회원 등급이다.
- 인증 완료 전 상태는 `PENDING_VERIFICATION`이다.

## API 흐름

1. `POST /api/auth/signup`
2. `POST /api/auth/verify-email`
3. `POST /api/auth/login` -> access/refresh 발급
4. `POST /api/auth/refresh` -> access/refresh 회전
5. `POST /api/auth/logout`
6. `GET /api/auth/me`

## 토큰 원칙

- 토큰에는 `userId`, `tier`만 포함한다.
- `permissions`는 절대 토큰에 넣지 않는다.
- 서버는 `UserTier#permissions()`로 권한을 산출한다.

## 에러 응답 스펙

```json
{
  "code": "UNAUTHORIZED" | "FORBIDDEN",
  "message": "...",
  "path": "/api/...",
  "timestamp": "2026-03-02T12:00:00Z"
}
```

## 확장 포인트

- Tier1(반려동물 인증), Tier2(신뢰) 승급 정책은 별도 서비스에서 판단한다.
- 예시: `io.pet.petyard.auth.policy.TierPolicyService`에서 사용자 상태를 평가하고 Tier를 결정한다.
- 권한 체크는 항상 `UserTier#permissions()`를 통해 수행한다.
