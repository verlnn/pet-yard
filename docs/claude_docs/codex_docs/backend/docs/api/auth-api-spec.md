# Auth API Spec (Onboarding 포함)

Base Path: `/api/auth`

## OAuth

### POST /oauth/kakao/start
Response:
```json
{
  "authorizeUrl": "https://kauth.kakao.com/oauth/authorize?...",
  "state": "uuid",
  "expiresAt": "2026-03-16T09:00:00Z"
}
```

### GET /oauth/kakao/callback
Query: `code`, `state`, `redirectUri`

Response (로그인 완료):
```json
{
  "status": "LOGIN",
  "accessToken": "...",
  "refreshToken": "..."
}
```

Response (온보딩 필요):
```json
{
  "status": "ONBOARDING",
  "signupToken": "...",
  "nextStep": "PROFILE"
}
```

## 온보딩

### GET /signup/progress
Header: `X-Signup-Token`
```json
{
  "step": "CONSENTS",
  "expiresAt": "2026-03-16T09:10:00Z",
  "hasPet": false
}
```

### POST /signup/profile
Header: `X-Signup-Token`
```json
{
  "nickname": "멍냥",
  "regionCode": "SEOUL-SONGPA",
  "profileImageUrl": null,
  "marketingOptIn": false,
  "hasPet": true
}
```
Response:
```json
{
  "nextStep": "CONSENTS"
}
```

### POST /signup/consents
Header: `X-Signup-Token`
```json
{
  "consents": [
    { "code": "SERVICE", "agreed": true },
    { "code": "PRIVACY", "agreed": true },
    { "code": "MARKETING", "agreed": false }
  ]
}
```
Response:
```json
{
  "nextStep": "PET | COMPLETE"
}
```

### POST /signup/pet
Header: `X-Signup-Token`
```json
{
  "name": "코코",
  "species": "DOG",
  "breed": "푸들",
  "birthDate": "2022-01-01",
  "ageGroup": "1-3세",
  "gender": "FEMALE",
  "neutered": true,
  "intro": "활발한 친구예요",
  "photoUrl": null
}
```
Response:
```json
{
  "nextStep": "COMPLETE"
}
```

### POST /signup/complete
Header: `X-Signup-Token`
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## 약관
### GET /terms
```json
{
  "terms": [
    { "code": "SERVICE", "version": 1, "title": "서비스 이용약관", "mandatory": true, "contentUrl": null }
  ]
}
```

## 이메일 가입/로그인 (기존)
- `POST /signup`
- `POST /verify-email`
- `POST /login`
- `POST /logout`
- `POST /refresh`
- `GET /me`

## Error Codes (주요)
- `OAUTH_STATE_MISMATCH`
- `OAUTH_PROVIDER_FAILED`
- `SOCIAL_EMAIL_CONFLICT`
- `NICKNAME_ALREADY_TAKEN`
- `REQUIRED_TERMS_MISSING`
- `SIGNUP_SESSION_EXPIRED`
- `SIGNUP_STEP_INVALID`
