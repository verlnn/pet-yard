# Auth Pages

## Routes
- `/login`
- `/signup`
- `/verify`

## Layout
- 좌측: `BrandPanel`
- 우측: `AuthCard` + `AuthTabs` + form
- 모바일: 세로 스택

## Modes
- Login
- Signup
- Verify Email (OTP)

## Redirect
- 로그인 후 `next` 파라미터가 있으면 해당 경로로 이동
- 없으면 기본 경로(`/feed`)로 이동
