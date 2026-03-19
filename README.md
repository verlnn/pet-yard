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



## 🚀 배포 흐름

### 1. 이미지 빌드

```bash
docker build -t petyard-web-image ./web
docker build -t petyard-server-image .
```

---

### 2. compose 실행

```bash
docker compose up -d
```

---

### 3.1 EC2로 파일 옮기기

```bash
docker save -o petyard-server-image.tar petyard-server-image

scp -i ~/???.pem ~/petyard-server-image.tar ubuntu@<EC2_IP>:~ 

docker load -i petyard-server-image.tar
```

---

### 3.2 Docker Hub ( Backend )

```bash

## Docker 로그인
docker login



# local
./gradlew clean build

docker buildx build \
  --platform linux/amd64 \
  -t verlnnennn/petyard-server-image:ec2-amd64-v1 \
  --push \
  .

# EC2
docker compose down
docker compose pull
docker compose up -d
docker logs -f petyard-server


## Log
docker logs -f --tail 300 petyard-server
```

---

### 3.2 Docker Hub ( Backend )

```bash
# local
docker build -t petyard-web-image .

docker buildx build \
  --platform linux/amd64 \
  -t verlnnennn/petyard-web-image:ec2-amd64-v1 \
  --push \
  .
  

# Test
docker run -p 3000:3000 petyard-web-image

  
# EC2
docker pull verlnnennn/petyard-web-image:ec2-amd64-v1


```







































## ⚙️ Tech Stack

<p>
  <img src="https://skillicons.dev/icons?i=java,spring,postgres,nextjs,ts,tailwind,docker,aws,nginx,githubactions" />
</p>


---

## ⚙️ Tech Stack

### 🧩 Backend
<p>
  <img src="https://skillicons.dev/icons?i=java,spring,postgres" />
</p>

### 🎨 Frontend
<p>
  <img src="https://skillicons.dev/icons?i=nextjs,ts,tailwind" />
</p>

### ⚙️ DevOps / Infra
<p>
  <img src="https://skillicons.dev/icons?i=docker,aws,nginx,githubactions" />
</p>



----

### 🧩 Backend
![Java](https://img.shields.io/badge/Java-25-red?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-green?logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring_Security-6-green?logo=springsecurity)
![JPA](https://img.shields.io/badge/JPA-Hibernate-orange?logo=hibernate)
![JWT](https://img.shields.io/badge/JWT-Auth-black?logo=jsonwebtokens)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Flyway](https://img.shields.io/badge/Flyway-DB_Migration-red?logo=flyway)

### 🎨 Frontend
![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwindcss)

### ⚙️ DevOps / Infra
![Docker](https://img.shields.io/badge/Docker-blue?logo=docker)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker)
![AWS EC2](https://img.shields.io/badge/AWS-EC2-orange?logo=amazonaws)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-green?logo=nginx)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-black?logo=githubactions)
![Docker Hub](https://img.shields.io/badge/Docker_Hub-Registry-blue?logo=docker)