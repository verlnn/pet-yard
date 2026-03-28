# 프론트 회원가입 UI 흐름

## 화면 목록
1. `/start` 인증 시작 화면
2. `/oauth/kakao/callback` 콜백 처리
3. `/onboarding/profile` 추가 정보 입력
4. `/onboarding/consents` 약관 동의
5. `/onboarding/pet` 반려동물 정보
6. `/onboarding/complete` 가입 완료
7. `/onboarding/error` 에러/재시도
8. `/login`, `/signup`, `/verify` 이메일 플로우

## UX 의도
- 카카오 버튼이 항상 메인 CTA
- 추가 정보 입력 이유를 명시
- 필수/선택 약관 구분
- 반려동물 등록은 선택이지만 자연스럽게 유도

## 컴포넌트 구조
- `OnboardingLayout`
- `OnboardingCard`
- 각 페이지별 form

## 상태 관리
- `signupToken`을 `localStorage`에 저장
- API 응답의 `nextStep`으로 라우팅 결정
