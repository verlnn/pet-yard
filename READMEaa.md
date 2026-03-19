# 🐾 PetYard (멍냥마당)

> 반려동물 기반 커뮤니티 · 산책 매칭 · 돌봄 플랫폼  
> **실제 운영을 목표로 설계된 Full-stack 서비스**

---

## 🌐 Live

- 🔗 https://www.pet-yard.org

---

## 🧭 Overview

PetYard는 반려동물 사용자들을 위한 통합 플랫폼입니다.

- 반려동물 SNS (기록/공유)
- 산책 매칭 및 커뮤니티
- 향후 위탁/돌봄 기능 확장 예정
- 향후 산책 관련 to-do 기능 예정

단순 CRUD 프로젝트가 아닌,  
**실제 운영을 고려한 아키텍처와 배포 환경**을 구축했습니다.

---



## 🛠 Tech Stack

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

---

## 🧱 Architecture

```
Client (Browser)
   ↓
Internet
   ↓
Nginx (Reverse Proxy + HTTPS)
├── Route: /        → Web (Next.js)
└── Route: /api     → API (Spring Boot)

EC2 Instance
└── Docker Compose
├── web (Next.js, Port 3000)
├── api (Spring Boot, Port 8080)
└── db (PostgreSQL, Port 5432)   
```

---

## 🐳 Docker Structure

| Service | Description |
|--------|------------|
| web    | Next.js frontend |
| api    | Spring Boot backend |
| db     | PostgreSQL (official image) |

---

## ⚙️ CI/CD Pipeline

GitHub Actions 기반 자동 배포

### 📌 Trigger
- `release` 브랜치 push 시 자동 실행

### 🔁 Flow

1. Docker Build (multi-stage)
2. Docker Hub Push (`latest`)
3. EC2 SSH 접속
4. `docker compose pull`
5. `docker compose up -d --force-recreate`

---

## 📦 Branch Strategy

```
develop → feature → release
```

| Branch  | Description |
|---------|------------|
| develop | 기능 개발 |
| feature | 통합 개발 |
| release | 배포 트리거 |


---

## 🔐 Authentication

- Kakao OAuth 로그인
- JWT 기반 인증/인가
- Stateless 구조

---

## 📌 Key Features

- 카카오 로그인 (OAuth)
- JWT 기반 인증 시스템
- 반려동물 중심 계정 확장 구조
- Docker 기반 서비스 분리
- CI/CD 자동 배포 환경 구축
- HTTPS 적용 (Let's Encrypt)

---


## 🧠 What I Focused On

- 단순 기능 구현이 아닌 **운영 가능한 구조 설계**
- Docker 기반 서비스 분리
- CI/CD 자동화
- 인증/인가 구조 설계 (JWT + OAuth)
- 확장 가능한 아키텍처

---

## 🧾 Summary

PetYard는 단순한 개인 프로젝트가 아닌,  
**실제 서비스 운영을 목표로 구축된 Full-stack 시스템**입니다.
