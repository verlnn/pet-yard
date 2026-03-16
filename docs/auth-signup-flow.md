# 멍냥마당 인증/회원가입 플로우

## 목표
- 소셜 로그인(카카오) 이후에도 서비스에 필요한 정보를 수집한다.
- 이메일 가입은 보조 수단으로 유지한다.
- 온보딩 이탈/복구가 가능하도록 상태를 분리한다.

## 전체 흐름 요약
1. **시작 화면**: "카카오톡으로 시작하기" 메인 CTA, 이메일 가입 보조 CTA.
2. **카카오 OAuth**: `/api/auth/oauth/kakao/start` → 카카오 인증 페이지 이동.
3. **콜백 처리**: `/api/auth/oauth/kakao/callback`
   - 기존 회원: 토큰 발급 후 로그인 완료
   - 신규/미완료 회원: `signupToken` 발급, 온보딩 시작
4. **추가 정보 입력**
   - 프로필(닉네임/지역/마케팅 동의/반려동물 유무)
   - 약관 동의(필수/선택)
   - 반려동물 정보(선택)
5. **가입 완료**: 계정 활성화 + 토큰 발급

## 시퀀스 (소셜 신규)
1. Start → Kakao OAuth
2. Callback → `signupToken` 발급
3. `/signup/profile` 저장
4. `/signup/consents` 저장
5. (선택) `/signup/pet` 저장
6. `/signup/complete` → `accessToken`/`refreshToken` 발급

## 이탈/복구
- `signupToken`으로 `/signup/progress` 호출하면 다음 단계 복구 가능
- 만료된 토큰은 재시작 필요

## 예외 시나리오
- **state mismatch**: OAuth 위변조/세션 만료
- **provider 실패**: 카카오 토큰/유저 조회 실패
- **닉네임 중복**
- **필수 약관 미동의**
- **가입 단계 건너뛰기**
- **정지/탈퇴 계정 재로그인**

## 확장 포인트
- 소셜 추가(Apple/Google): `OAuthClient` 구현체 추가
- 인증 단계 분리: 반려동물 인증/신뢰 인증(Tier2)

## 환경변수 예시
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`
- `KAKAO_REDIRECT_URI`
- `APP_BASE_URL`
