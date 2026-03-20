# Codex Working Agreement

## Language
- Respond in Korean by default.
- Keep responses concise and practical.

## Commit Rules
- Commit automatically after completing a user-requested implementation task unless the user explicitly says not to commit.
- Write commit messages in Korean.
- Prefer the format: `type(scope): 설명`
- Examples:
  - `feat(onboarding): 반려동물 온보딩 등록번호 인증 흐름 추가`
  - `refactor(onboarding): 프로필 온보딩 페이지를 단계별 컴포넌트로 분리`
  - `fix(flyway): Spring Boot 4 Flyway 자동 실행 의존성 추가`

## Frontend Rules
- Do not leave long Tailwind utility strings directly in JSX when the element has a meaningful role.
- Prefer semantic class names such as `profile-card`, `onboarding-profile-step-panel`, `feed-detail-menu-trigger`.
- Move actual style definitions to a shared stylesheet such as `web/app/globals.css` using `@layer components` when appropriate.
- If you touch an existing frontend file and its class naming is unclear or purely utility-stacked, refactor it toward semantic class names as part of the task when practical.

## Component Design Rules
- If a frontend component has too many responsibilities, split it before or while implementing the requested change.
- Separate by role or feature, not arbitrarily.
- Page components should mainly keep orchestration concerns:
  - routing
  - API calls
  - local state coordination
  - step flow control
- Move rendering-heavy sections into feature components.
- Typical split targets:
  - progress/header sections
  - form step panels
  - reusable field groups
  - modal/menu/detail sections

## Refactoring Priority
- When modifying frontend code, first check:
  1. Are class names semantic and readable?
  2. Is one component doing too many things?
- If either answer is no, refactor that structure first, then continue the requested task.

## Verification Rules
- For frontend changes, run `npx tsc --noEmit` when possible.
- For backend changes, run `./gradlew compileJava` when possible.
- Mention if verification could not be run.

## Collaboration Style
- Do not ask the user to repeat these preferences in later sessions.
- Follow this document by default for new tasks in this repository.
