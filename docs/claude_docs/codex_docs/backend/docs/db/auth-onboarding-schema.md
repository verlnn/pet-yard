# Auth/Onboarding DB Schema

## 주요 테이블
- `auth.users`: 계정 상태/티어
- `auth.auth_identities`: 인증 수단 (provider + providerUserId 유니크)
- `auth.user_profiles`: 닉네임/지역/마케팅 동의
- `auth.signup_sessions`: 온보딩 세션
- `auth.terms`, `auth.terms_agreements`: 약관 버전/동의 이력
- `auth.regions`: 지역 코드
- `pet.pet_profiles`: 반려동물 프로필

## 제약/인덱스
- `auth.auth_identities(provider, provider_user_id)` 유니크
- `auth.auth_identities(email)` 유니크 (null 제외)
- `auth.user_profiles(nickname)` 유니크
- `auth.signup_sessions(state)` 유니크
- `auth.signup_sessions(session_token)` 유니크

## 설계 이유
- 소셜 인증 확장성 확보
- 온보딩 이탈 복구 지원
- 약관 버전 추적 가능
