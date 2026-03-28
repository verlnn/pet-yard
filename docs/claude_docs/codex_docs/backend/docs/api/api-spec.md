# API Spec

## Current State

The backend now exposes a project-wide OpenAPI document through springdoc.
Swagger is treated as the runtime API contract for controllers, request DTOs, response DTOs, and common error responses.

## Swagger Access

- Local/dev only
- OpenAPI JSON: `/v3/api-docs`
- Swagger UI: `/swagger-ui/index.html`
- Legacy redirect path: `/swagger-ui.html`

The application keeps Swagger disabled in the shared base config and only enables it in the `local` profile.
This prevents accidental exposure in release environments.

## Authentication

### Bearer token

Most protected APIs use JWT access tokens through the `Authorization` header.

Example:

```http
Authorization: Bearer <access-token>
```

Swagger is configured with a `bearerAuth` security scheme so protected endpoints can be tested directly in the UI.

### Public username

`username` is a public identifier and is intentionally separated from the internal bigint primary key `id`.

- login remains email-based
- profile URLs and public lookup can use username
- username is normalized to lowercase before persistence
- username rule: `^(?!\\.)(?!.*\\.\\.)(?!.*\\.$)[a-z0-9._]{1,30}$`

### Signup token

Signup/onboarding progression APIs also use a dedicated header:

```http
X-Signup-Token: <signup-session-token>
```

This is documented per endpoint because it is not interchangeable with the bearer token flow.

## Error Contract

The documented common error payload is based on `io.pet.petyard.auth.security.ErrorResponse`.

Fields:

- `code`: stable application error code such as `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`
- `message`: user-facing error summary
- `path`: request URI
- `timestamp`: server timestamp

The following status semantics are used consistently in Swagger where relevant:

- `400`: invalid request, validation failure, bad state transition, missing required data
- `401`: authentication required or invalid credentials/token
- `403`: authenticated but not permitted
- `404`: currently used only where a controller explicitly models missing resources
- `500`: unexpected server error

## API Groups

Swagger groups controllers using `@Tag`.

### Auth

- email signup
- email verification
- login
- refresh
- logout
- current user lookup
- username-aware signup contract

### OAuth

- social login start
- OAuth callback handling

### Signup

- signup progress
- profile step
- consents step
- pet verification and save
- signup completion

### Feed

- home feed
- own posts
- create post
- paw add/remove
- delete post

### User Profile

- current profile read
- profile settings update
- public profile lookup by `GET /api/users/{username}/profile`

### Pets

- pet verification
- pet create/update/delete
- pet breed lookup

### Terms

- signup terms lookup

### Regions

- region list lookup

### Health

- process health check

### Walk / Boarding

- placeholder business endpoints for walk/boarding flows

## Documentation Rules Applied

The current Swagger setup follows these rules:

- every controller has a meaningful tag description
- every public endpoint has an `@Operation`
- request/response DTOs expose field descriptions through `@Schema`
- protected endpoints declare bearer auth in the document
- major success and failure responses are documented through `@ApiResponses`

## This Change

This work added:

- springdoc-openapi dependency and config
- local-only Swagger exposure
- bearer auth security scheme
- controller-level tags and operation descriptions
- DTO field descriptions and examples
- error response documentation for major failure cases
- public username field to signup / profile / public profile contracts
- username-based public profile lookup path
- explicit separation between internal `id` and public `username`

## Username-related API Changes

### Email signup

`POST /api/auth/signup`

Request:

- `username`
- `email`
- `password`

Response:

- `userId`
- `email`
- `username`
- `expiresAt`

### Current profile

`GET /api/users/me/profile`

Response now includes:

- `username`

### Profile settings update

`PATCH /api/users/me/profile`

Request can now include:

- `username`
- `bio`
- `gender`
- `primaryPetId`

### Public profile lookup

`GET /api/users/{username}/profile`

Purpose:

- expose public profile routes without leaking internal numeric ids
- prepare for mentions, search, profile share URLs

## Remaining Limits

- some simple placeholder endpoints still return lightweight map bodies rather than dedicated DTOs
- not every possible domain exception has a unique controller-level response entry
- onboarding `X-Signup-Token` is documented per endpoint rather than as a separate reusable OpenAPI security scheme

## Next Improvements

- introduce explicit response DTOs for remaining placeholder map responses
- add richer examples for multipart feed upload requests
- document domain-specific 404 cases if those endpoints are introduced later
- generate static OpenAPI artifacts in CI if external consumers need versioned specs
- decide whether username change history or cooldown policy is needed before public rollout
