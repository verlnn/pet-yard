# Tech Stack

이 문서는 현재 저장소 설정 파일 기준으로 확인된 기술 스택을 정리한 문서입니다.

## Backend

- Language: Java 25
- Build Tool: Gradle
- Framework: Spring Boot 4.0.3
- Dependency Management: `io.spring.dependency-management` 1.1.7
- Web: `spring-boot-starter-webmvc`
- Security: `spring-boot-starter-security`
- Persistence: Spring Data JPA
- Validation: Spring Validation
- Mail: Spring Mail
- Database Migration: Flyway
- API Documentation: springdoc OpenAPI + Swagger UI (`org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6`)
- JWT: JJWT 0.11.5

## Database

- Main DB: PostgreSQL
- Migration DB Support: `flyway-database-postgresql`
- Test DB: H2

## Frontend

- Framework: Next.js 16.2.0
- UI Runtime: React 19.0.0
- Language: TypeScript 5.6.3
- Styling: Tailwind CSS 3.4.14
- PostCSS: PostCSS 8.4.47
- Sass: 1.97.3
- Animation: Framer Motion 12.38.0
- Data Fetching / Cache: TanStack React Query 5.59.0
- Form: React Hook Form 7.54.0
- Schema Validation: Zod 3.23.8
- UI Primitives:
  - Radix UI Avatar
  - Radix UI Dropdown Menu
  - Radix UI Select
  - Radix UI Slot
  - Radix UI Tabs
- Icons: Lucide React 0.458.0
- Utility Libraries:
  - `clsx`
  - `class-variance-authority`
  - `tailwind-merge`
  - `tailwindcss-animate`

## Frontend Tooling

- Lint: ESLint 9
- Format: Prettier 3
- Prettier Plugin: `prettier-plugin-tailwindcss`
- React/Vite Test Runtime: Vitest 2.1.4
- DOM Test Environment: jsdom
- Component Test Utilities:
  - Testing Library React
  - Testing Library Jest DOM
- E2E Test: Playwright 1.48.2

## Backend Testing

- Test Framework: JUnit Platform
- Spring Test: `spring-boot-starter-test`
- MVC Test: `spring-boot-starter-webmvc-test`
- Security Test: `spring-security-test`

## Infra / Runtime Notes

- Local backend DB 기본값은 PostgreSQL(`jdbc:postgresql://localhost:5432/petyard`) 기준입니다.
- 테스트 프로파일은 H2 in-memory DB를 사용합니다.
- 이메일 발송은 SMTP 설정 기반입니다.
- Swagger/OpenAPI는 springdoc으로 노출됩니다.
- 프론트는 별도 `web/` 앱으로 분리되어 있으며 Next.js App Router 기반입니다.

## Source of Truth

- Backend: [build.gradle](/Users/gimminsu/DevProjects/pet-yard/build.gradle)
- Frontend: [package.json](/Users/gimminsu/DevProjects/pet-yard/web/package.json)
- Backend runtime config: [application.yaml](/Users/gimminsu/DevProjects/pet-yard/src/main/resources/application.yaml)
- Backend test config: [application.yaml](/Users/gimminsu/DevProjects/pet-yard/src/test/resources/application.yaml)
