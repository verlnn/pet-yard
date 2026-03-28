# Auth Component Structure

## Components
- `AuthLayout`: 레이아웃 그리드
- `BrandPanel`: 브랜드 소개
- `AuthCard`: 카드 레이아웃/메시지
- `AuthTabs`: 로그인/회원가입 탭
- `LoginForm`
- `SignupForm`
- `VerifyEmailForm`

## Hooks
- `useAuthForms`: 상태/메시지/로딩/액션 관리

## API
- `authApi`: signup/verify/login/me 호출
- `onboarding`: 소셜 가입 추가 정보 입력

## Pages
- `AuthPage`에서 mode별 폼 조립
