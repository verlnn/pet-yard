# 🐾 PetYard (멍냥마당)

반려 생활을 위한 커뮤니티/산책/돌봄 플랫폼을 목표로 하는 웹 프로젝트입니다.

## Stack
- Backend: Java 25, Spring Boot, Spring Security, JPA, JWT, PostgreSQL
- Frontend: Next.js(App Router), Tailwind CSS, TypeScript
- DB Migration: Flyway
- Test: JUnit, MockMvc, (향후 Vitest/Playwright)


---


## 🧱 Architecture

```
EC2
 └ docker-compose
    ├ web (Next.js)
    ├ api (Server - Spring)
    └ db (PostgreSQL - official image)
```


---

## 🐳 docker-compose.yml 예시

```yaml
version: "3.8"

services:
  web:
    image: petyard-web-image
    ports:
      - "3000:3000"
    depends_on:
      - api

  api:
    image: petyard-server-image
    ports:
      - "8080:8080"
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: verlnn
      POSTGRES_PASSWORD: qwer123@
      POSTGRES_DB: petyard
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---


## 🏗️ 이미지 구성

### 1. petyard-web-image
- Next.js 기반
- 프론트엔드 서버

### 2. petyard-server-image
- Java (Spring) 또는 Node API 서버

### 3. PostgreSQL
- 공식 이미지 사용 (`postgres:15`)

---


