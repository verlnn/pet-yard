# Auth API (Tier0)

Base Path: `/api/auth`

## Sign Up
`POST /signup`

Request:
```json
{
  "email": "user@example.com",
  "password": "pass1234"
}
```

Response: `200 OK`
```json
{
  "email": "user@example.com",
  "expiresAt": "2026-03-14T07:30:00Z"
}
```

## Verify Email (OTP)
`POST /verify-email`

Request:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

Response: `200 OK`

## Extend Email Verification (OTP)
`POST /extend-email`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "expiresAt": "2026-03-14T07:31:00Z"
}
```

## Resend Email Verification (OTP)
`POST /resend-email`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "expiresAt": "2026-03-14T07:33:00Z"
}
```

## Login
`POST /login`

Request:
```json
{
  "email": "user@example.com",
  "password": "pass1234"
}
```

Response:
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Refresh
`POST /refresh`

Request:
```json
{
  "refreshToken": "..."
}
```

Response:
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Logout
`POST /logout`

Request:
```json
{
  "refreshToken": "..."
}
```

Response: `200 OK`

## Me
`GET /me`

Header:
```
Authorization: Bearer <accessToken>
```

Response:
```json
{
  "userId": 1,
  "tier": "TIER_0",
  "permissions": ["AUTH_BASIC", "FEED_READ"]
}
```

## Error Response
```json
{
  "code": "UNAUTHORIZED | FORBIDDEN | BAD_REQUEST",
  "message": "...",
  "path": "/api/auth/...",
  "timestamp": "2026-03-09T12:00:00Z"
}
```

## Error Codes (OTP)
- `VERIFICATION_CODE_EXPIRED`: 인증 코드가 만료됨
- `VERIFICATION_CODE_NOT_EXPIRED`: 인증 코드가 아직 만료되지 않음
- `VERIFICATION_EXTEND_RATE_LIMIT`: 1초 내 연장 요청 2회 초과
- `VERIFICATION_CODE_NOT_FOUND`: 인증 코드가 없음
- `INVALID_VERIFICATION_CODE`: 코드 불일치

## Validation
- Email format is validated.
- Password is required for signup/login.
- OTP must be 6 digits.
