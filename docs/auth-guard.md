# Auth Guard

## 원칙

- 토큰에는 `userId`, `tier`만 포함한다.
- `permissions`는 토큰에 넣지 않는다.
- 권한은 항상 서버에서 `UserTier#permissions()`로 산출한다.

## 요청 처리 흐름

1. `JwtAuthenticationFilter`가 Authorization 헤더의 Bearer 토큰을 파싱한다.
2. 토큰에서 `uid`, `tier`를 꺼내 `AuthPrincipal`을 생성한다.
3. `AuthPrincipal`을 `SecurityContext`에 저장한다.
4. `@RequirePermission`가 `SecurityContext`의 principal 권한을 검사한다.

## @RequirePermission 사용법

```java
@RequirePermission(Permission.FEED_CREATE)
@PostMapping("/api/feed")
public Map<String, Object> createFeed() {
    // ...
}

@RequirePermission(value = {Permission.WALK_APPLY, Permission.WALK_CHAT}, mode = RequirePermission.Mode.ALL)
@PostMapping("/api/walk/apply")
public Map<String, Object> applyWalk() {
    // ...
}
```

## 에러 응답 규격

401 Unauthorized (토큰 오류/만료)
```json
{"code":"AUTH_INVALID_TOKEN","message":"Invalid or expired token"}
```

401 Unauthorized (인증 필요)
```json
{"code":"AUTH_REQUIRED","message":"Authentication required"}
```

403 Forbidden
```json
{"code":"PERMISSION_DENIED","message":"Permission denied"}
```

## 향후 Tier 정책 연결 위치

- Tier 승급/하향 조건은 별도의 정책 모듈에 둔다.
- 예시: `io.pet.petyard.auth.policy` 패키지의 `TierPolicyService`에서 판단하고,
  토큰에는 `tier`만 넣어 서버에서 권한을 산출한다.
