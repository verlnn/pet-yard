# Auth/Onboarding Domain Design

## 도메인 분리
- Auth: 로그인/토큰/인증수단
- Onboarding: 가입 진행 상태
- User: 사용자 프로필
- Terms: 약관/동의
- Pet: 반려동물 프로필

## Aggregate 후보
- **User** (Auth)
  - AuthIdentity (Value-like)
  - AccountStatus
- **SignupSession** (Onboarding)
  - 상태/단계/만료
- **UserProfile** (User)
- **Terms / TermsAgreement** (Terms)
- **PetProfile** (Pet)

## 핵심 규칙
- 소셜 로그인은 `AuthIdentity`로 분리하여 확장 가능
- `SignupSession`으로 온보딩 단계/복구 처리
- 필수 약관 미동의 시 진행 불가
- 닉네임은 유니크

## 트랜잭션 경계
1. OAuth 콜백 → 사용자/identity/session 생성
2. 프로필 저장
3. 약관 동의
4. 반려동물 등록
5. 가입 완료(토큰 발급)

## 질문에 대한 답
### Q1. 소셜 인증 성공했지만 가입 미완료는?
- `AccountStatus = PENDING_ONBOARDING`
- `SignupSession` 유지

### Q2. 이탈 사용자 복구는?
- `signupToken`으로 `/signup/progress`
- 만료 시 재시작

### Q3. 다중 인증수단 연결은?
- `auth_identities`에 provider + providerUserId 조합으로 유니크 보장
- 동일 이메일 충돌은 `SOCIAL_EMAIL_CONFLICT` 처리
