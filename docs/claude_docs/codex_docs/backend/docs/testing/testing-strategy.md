# Testing Strategy

## Current State

The previous backend test set was not treated as reliable by default.
Tests that no longer matched the current controller/service/repository structure were removed, and the suite was rebuilt around the actual application boundaries.

The test suite now follows three clear layers:

- controller tests
- service tests
- repository tests

## Layer Responsibilities

### 1. Controller tests

Purpose:

- verify request mapping
- verify request/response payload shape
- verify status codes
- verify validation failures and exception handler integration

Implementation rules:

- use `@WebMvcTest`
- mock downstream ports/services
- keep focus on HTTP contract, not business internals

Current examples:

- `AuthControllerTest`
- `FeedControllerTest`
- `OAuthControllerTest`
- `SignupControllerTest`
- `UserProfileControllerTest`
- `PetProfileControllerTest`
- `PublicApiControllerTest`
- `WalkBoardingControllerTest`

### 2. Service tests

Purpose:

- verify business branching
- verify state transitions
- verify port interaction
- catch domain bugs before hitting MVC or DB layers

Implementation rules:

- plain JUnit + Mockito
- one business rule per test
- fixtures with explicit meaning

Current examples:

- `AuthApplicationServiceTest`
- `OnboardingApplicationServiceTest`
- `FeedApplicationServiceTest`
- `FeedHomeRequestTraceTest`

### 3. Repository tests

Purpose:

- verify actual persistence behavior
- verify query correctness
- verify cursor pagination ordering and boundaries

Implementation rules:

- use slice/integration style where query behavior matters
- prefer deterministic fixture data

Current examples:

- `FeedPostRepositoryTest`
- `FeedHomeQueryCountTest`

## Removed Tests

The following tests were deleted because they no longer matched the current architecture or were not trustworthy enough to keep as a base:

- `PetYardApplicationTests`
- `AuthGuardIntegrationTest`
- `AuthTier0IntegrationTest`
- `OnboardingIntegrationTest`

Reasons:

- they coupled too tightly to older application structure
- they did not reflect current controller/service boundaries
- they made the suite noisy without providing reliable regression protection

## Test Writing Rules

### Structure

Use `given / when / then` flow implicitly or explicitly.
Each test should verify one behavior only.

### Naming

Test names must describe the behavior being verified, not the implementation detail.

Good examples:

- `회원가입은 대기 사용자와 인증 코드를 저장하고 메일을 보낸다`
- `약관 저장은 필수 약관 미동의 시 실패한다`
- `홈 피드 조회는 cursor와 hasMore를 응답으로 반환한다`

### Fixture quality

Do not use meaningless random data.
Use named fixture values that explain why the case exists.

### Assertions

Prefer assertions that reveal the contract:

- status code
- error code
- next step
- tier/status transition
- saved entity interaction

## Supporting Test Utilities

The suite keeps a small number of reusable helpers:

- `MutableClock`
- `CapturingOtpGenerator`
- `TestEmailSender`
- `TestOtpConfig`
- `TestOAuthConfig`
- `WebMvcSliceTestConfig`

`WebMvcSliceTestConfig` exists specifically to make MVC slice tests deterministic:

- static resource config gets a stable `FileStorageProperties` bean
- `@AuthenticationPrincipal AuthPrincipal` is resolved consistently in `@WebMvcTest`

## Coverage Focus

The rebuilt tests explicitly cover:

- success paths
- validation failures
- auth/permission failures exposed at controller level
- cursor pagination boundaries
- feed tie-break behavior
- onboarding step transitions
- signup/login/refresh core flows

## How To Add New Tests

### New controller endpoint

Add or update a `@WebMvcTest` class when:

- request fields change
- response JSON changes
- validation rules change
- exception mapping changes

### New service rule

Add a service test when:

- state transitions are introduced
- ports are called conditionally
- a new error branch is introduced

### New repository query

Add a repository test when:

- ordering matters
- pagination/cursor behavior matters
- a query is non-trivial enough that mocking would hide bugs

## This Change

This rework introduced:

- controller tests aligned with the current MVC contract
- new service tests for auth and onboarding flows
- removal of outdated high-noise tests
- deterministic WebMvc slice support config

## Remaining Limits

- the suite does not include full end-to-end browser/API scenario coverage
- external integrations are still mocked at the service/controller boundary
- placeholder walk/boarding endpoints are only lightly covered because their server-side business logic is still minimal

## Next Improvements

- add CI reporting for test counts and flaky test detection
- add contract snapshots for larger JSON responses if response shapes grow
- add dedicated integration tests for file upload/storage behavior when that flow becomes more critical
