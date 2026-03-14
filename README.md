# PetYard (멍냥마당)

반려 생활을 위한 커뮤니티/산책/돌봄 플랫폼을 목표로 하는 웹 프로젝트입니다.

## Stack
- Backend: Java 25, Spring Boot, Spring Security, JPA, JWT, PostgreSQL
- Frontend: Next.js(App Router), Tailwind CSS, TypeScript
- DB Migration: Flyway
- Test: JUnit, MockMvc, (향후 Vitest/Playwright)

## Backend Run
1. 환경 변수 설정

```
DB_URL=jdbc:postgresql://localhost:5432/petyard
DB_USERNAME=petyard
DB_PASSWORD=petyard
```

2. 실행

```
./gradlew bootRun
```

## Frontend Run
1. 의존성 설치

```
cd web
npm install
```

2. 개발 서버 실행

```
npm run dev
```

## Tests
```
./gradlew test
```

## Docs
- `docs/backend/auth-architecture.md`
- `docs/backend/auth-api.md`
- `docs/backend/auth-security.md`
- `docs/backend/auth-testing.md`
- `docs/backend/auth-email.md`
- `docs/database/auth-schema.md`
- `docs/database/migration-guide.md`
- `docs/frontend/auth-pages.md`
- `docs/frontend/routing-guard.md`
- `docs/frontend/component-structure.md`
- `docs/testing/strategy.md`
- `docs/implementation-audit.md`
