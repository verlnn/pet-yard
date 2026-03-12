# Auth Architecture (Hexagonal)

## Goals
- 도메인 중심 설계로 인증/인가 정책을 안정적으로 확장한다.
- 외부 시스템(JPA/웹/보안)을 어댑터로 분리해 의존 방향을 일관되게 유지한다.

## Package Layout

```
io.pet.petyard.auth
├── domain
│   ├── AccountStatus, UserTier, Permission
│   └── model (User, EmailVerification, RefreshToken)
├── application
│   ├── port.in (UseCases)
│   ├── port.out (Persistence Ports)
│   └── service (AuthApplicationService)
├── adapter
│   ├── in.web (AuthController, DTOs, ExceptionHandler)
│   └── out.persistence (Repositories, AuthPersistenceAdapter)
├── security (JWT filter, SecurityConfig, AuthPrincipal)
└── jwt (JwtTokenProvider, AccessClaims, JwtProperties)
```

## Inbound Use Cases
- `SignUpUseCase`
- `VerifyEmailUseCase`
- `LoginUseCase`
- `RefreshTokenUseCase`
- `LogoutUseCase`
- `GetCurrentUserUseCase`

## Outbound Ports
- `LoadUserPort` / `SaveUserPort`
- `SaveEmailVerificationPort` / `LoadLatestPendingEmailVerificationPort`
- `SaveRefreshTokenPort` / `LoadRefreshTokenPort` / `RevokeRefreshTokenPort`

## Runtime Flow (Tier0)
1. Web adapter receives request.
2. Use case is invoked via `AuthApplicationService`.
3. Service uses outbound ports to load/save domain models.
4. JWT provider issues access/refresh tokens.
5. Security adapter validates tokens and builds `AuthPrincipal`.

## Notes
- 현재 도메인 모델은 JPA 엔티티 기반(`auth.domain.model`)이며, 이후 필요 시 순수 도메인 모델로 분리할 수 있다.
- JWT Claims에는 `userId`, `tier`만 포함하며 권한은 서버에서 계산한다.
