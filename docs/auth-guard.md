# Auth Guard

## 원칙

- 토큰에는 `tier`만 포함한다.
- `permissions`는 토큰에 넣지 않는다.
- 권한은 항상 서버에서 `UserTier#permissions()`로 산출한다.

## AuthContext 생성 흐름

1. `JwtAuthFilter`가 Authorization 헤더의 Bearer 토큰을 파싱한다.
2. 토큰에서 `uid`, `tier`를 꺼내 `AuthContext`를 생성한다.
3. `AuthContextHolder`와 요청 속성(`AUTH_CONTEXT`)에 저장한다.
4. 컨트롤러/인터셉터는 `AuthContext`를 통해 권한을 확인한다.

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

401 Unauthorized
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
