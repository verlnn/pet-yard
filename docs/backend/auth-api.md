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

## Validation
- Email format is validated.
- Password is required for signup/login.
- OTP must be 6 digits.
