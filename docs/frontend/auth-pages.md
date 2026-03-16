# Auth Pages

## Routes
- `/start`
- `/login`
- `/signup`
- `/verify`

## Layout
- 상단 로고 + 단일 카드 레이아웃
- `AuthCard` + form 구성
- 모바일: 동일한 단일 컬럼

## Modes
- Login
- Signup
- Verify Email (OTP)

## Verify Email UX
- 3분 카운트다운 노출
- `인증 시간 1분 연장` 버튼 제공 (만료 전)
- 만료 시에만 `재전송` 버튼 노출

## Redirect
- 로그인 후 `next` 파라미터가 있으면 해당 경로로 이동
- 없으면 기본 경로(`/feed`)로 이동
