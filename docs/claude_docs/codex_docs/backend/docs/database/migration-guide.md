# Migration Guide (Flyway)

## Location
- `src/main/resources/db/migration`
- Versioning: `V{number}__{description}.sql`

## Current Migrations
- `V1__init_auth_tier0.sql`
- `V2__email_verification_extend.sql`
- `V3__auth_onboarding.sql`

## Local Setup
1. PostgreSQL DB 생성
2. 환경 변수 설정

```
DB_URL=jdbc:postgresql://localhost:5432/petyard
DB_USERNAME=petyard
DB_PASSWORD=petyard
```

## Run
```
./gradlew bootRun
```

## Test Profile
- `src/test/resources/application.yaml`에서 Flyway 비활성화
- H2 in-memory + `ddl-auto: create-drop`
