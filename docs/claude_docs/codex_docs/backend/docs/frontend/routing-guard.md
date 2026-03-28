# Routing Guard

## 1차 Guard (Server Layout)
- `app/(app)/layout.tsx`
- `accessToken` 쿠키 확인 후 미존재 시 `/login?next=...` 리다이렉트

## 2차 Guard (Middleware)
- `middleware.ts`
- 정적/공개 경로 제외 후 cookie 검사
- 보호 경로에서 `x-pathname` 헤더를 주입해 서버 레이아웃에 전달

## Notes
- access token 유효성 검증은 서버 API 호출로 확장 가능
