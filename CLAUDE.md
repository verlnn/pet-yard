# PetYard (멍냥마당) — CLAUDE.md

Claude Code가 이 저장소에서 작업할 때 기본 컨텍스트로 사용하는 문서입니다.

---

## 프로젝트 개요

**PetYard(멍냥마당)**는 반려동물 기반 통합 커뮤니티 플랫폼입니다.

- 반려동물 성장 기록 중심의 SNS 피드
- 동네 기반 산책 매칭
- 위탁 주선 (돌봄 매칭)
- 반려동물 종류별 건강검진/주의사항 지식 제공

단순 CRUD가 아닌 **실제 운영을 목표로 설계된 Full-stack 서비스**입니다.

Live: https://www.pet-yard.org

---

## 도메인 용어 (서비스 고유 용어)

| 일반 용어 | 서비스 용어 | 설명 |
|---------|-----------|------|
| 좋아요 | 발자국 (paw) | 피드 게시글 반응 |
| 팔로우 | 집사요청 | 사용자 간 연결 요청 |
| 팔로워 | 집사 | 연결된 사용자 |

코드 내 변수명/API명/UI 텍스트 모두 이 용어를 따릅니다.

---

## 기술 스택

### Backend
- **Language**: Java 25
- **Framework**: Spring Boot 4.0.3
- **Build**: Gradle
- **Web**: Spring MVC (`spring-boot-starter-webmvc`)
- **Security**: Spring Security 6 + JWT (JJWT 0.11.5)
- **Persistence**: Spring Data JPA (Hibernate)
- **Validation**: Spring Validation
- **DB Migration**: Flyway (PostgreSQL 지원)
- **API 문서**: springdoc OpenAPI + Swagger UI
- **Mail**: Spring Mail (SMTP)

### Database
- **운영**: PostgreSQL 15
- **테스트**: H2 in-memory

### Frontend
- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4 + Sass
- **Animation**: Framer Motion 12
- **Data Fetching**: TanStack React Query 5
- **Form**: React Hook Form 7 + Zod 3
- **UI Primitives**: Radix UI (Avatar, DropdownMenu, Select, Slot, Tabs)
- **Icons**: Lucide React
- **Utilities**: clsx, class-variance-authority, tailwind-merge

### DevOps / Infra
- Docker + Docker Compose
- AWS EC2 (단일 인스턴스)
- Nginx (Reverse Proxy + HTTPS/Let's Encrypt)
- GitHub Actions (CI/CD)
- Docker Hub (이미지 레지스트리)

### 테스트
- **Backend**: JUnit, spring-boot-starter-test, spring-security-test
- **Frontend**: Vitest 2, Testing Library, Playwright 1.48

---

## 아키텍처 원칙

### 헥사고날 아키텍처 (Ports & Adapters)

```
Domain (순수 도메인 모델/규칙 — 프레임워크 의존 금지)
  ↑
Application (유스케이스/서비스/트랜잭션 경계)
  ↑ Port In (UseCase 인터페이스)
  ↓ Port Out (저장소/외부 API 인터페이스)
  ↕
Adapters
  - In: Web Controller, REST, DTO 매핑, 검증
  - Out: JPA Repository, OAuth, Mail, S3 등
```

**레이어 의존성 방향**: Adapter → Application → Domain (역방향 금지)

### DDD (도메인 주도 설계)

- Bounded Context 분리: `auth`, `onboarding`, `user`, `pet`, `feed`, `notification`, `region`, `terms`
- Aggregate Root, Entity, Value Object, Domain Service 명확히 구분
- 도메인 모델은 JPA 등 프레임워크 의존 없이 순수하게 유지

### OOP / SOLID

- 단일 책임 원칙 (SRP): 클래스/메서드 하나의 책임
- 개방-폐쇄 원칙 (OCP): 확장에 열려있고 수정에 닫혀 있게
- 의존성 역전 원칙 (DIP): 포트(인터페이스)를 통한 의존
- 확장성/유지보수성/테스트 용이성 우선

---

## 서버 패키지 구조

기준 경로: `src/main/java/io/pet/petyard`

```
io/pet/petyard
├── auth/
│   ├── adapter/
│   │   ├── in/web/          # AuthController, OnboardingController 등
│   │   └── out/
│   │       ├── mail/        # EmailVerificationAdapter
│   │       ├── oauth/       # KakaoOAuthAdapter
│   │       └── persistence/ # UserJpaAdapter, RefreshTokenJpaAdapter 등
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/          # SignUpUseCase, LoginUseCase, TokenUseCase 등
│   │   │   └── out/         # UserPort, RefreshTokenPort, EmailVerificationPort 등
│   │   └── service/         # AuthService, OnboardingService, TokenService 등
│   ├── domain/model/        # User, AuthIdentity, RefreshToken, EmailVerification 등
│   └── config/context/filter/guard/jwt/oauth/security/
├── common/                  # 공통 기술 요소 (예외, 응답 포맷, 유틸)
├── feed/
│   ├── adapter/
│   │   ├── in/web/          # FeedController
│   │   └── out/persistence/ # FeedPostJpaAdapter
│   ├── application/
│   │   ├── model/           # FeedPage, FeedCursor 등 애플리케이션 모델
│   │   ├── port/out/        # FeedPostPort
│   │   └── service/         # FeedService
│   └── domain/model/        # FeedPost, FeedPostImage, Hashtag 등
├── notification/            # 알림
├── onboarding/              # 회원가입 진행 세션 관리
├── pet/                     # 반려동물 프로필
├── region/                  # 지역 정보
├── terms/                   # 약관/동의
├── user/                    # 사용자 프로필 (집사 관계)
└── web/                     # 웹 진입 보조 구성 (GlobalExceptionHandler 등)
```

각 도메인은 `adapter / application / domain` 삼층 구조를 따릅니다.

---

## DB 구조 요약

### 스키마 분리

| 스키마   | 주요 테이블 |
|---------|------------|
| `auth`  | `users`, `auth_identities`, `refresh_tokens`, `email_verifications`, `signup_sessions`, `tiers`, `terms`, `terms_agreements`, `login_logs`, `error_logs`, `region_levels`, `regions`, `user_profiles` |
| `feed`  | `feed_posts`, `feed_post_images`, `feed_post_hashtags`, `hashtags`, `feed_post_paws` |
| `pet`   | `pet_profiles`, `breeds` |
| `core`  | 공통 오브젝트 |

### 주요 설계 포인트

- `users.tier`: `tiers` 테이블 FK, 권한 SSOT는 코드(`UserTier` enum)에 있음
- `users.status`: `PENDING_VERIFICATION | ACTIVE | SUSPENDED | DELETED | PENDING_ONBOARDING`
- `auth_identities`: OAuth provider + providerUserId 조합 유니크 (다중 소셜 연결 지원)
- `refresh_tokens`: 평문 저장 금지, 해시 저장, 회전(rotation) 지원
- `email_verifications`: OTP 해시 저장, 시도 횟수/만료 관리
- `signup_sessions`: 온보딩 단계/상태/복구 지원 (JSONB metadata)
- Soft delete: `deleted_at` 컬럼 사용
- 모든 시각 컬럼은 `timestamp with time zone` (UTC 기준)
- `touch_updated_at()` 트리거로 `updated_at` 자동 갱신

### Flyway 마이그레이션 규칙

- 스키마별 디렉토리 사용: `db/migration/auth/`, `db/migration/feed/`, `db/migration/pet/`, `db/migration/core/`
- 파일 명명: `V{number}__{schema}_{subject}.sql` (예: `V10__auth_refresh_tokens_table.sql`)
- 파일 하나 = 테이블 하나 또는 변경 주제 하나
- 강하게 결합된 테이블/seed는 같은 파일에 허용

---

## 사용자 티어 (권한 모델)

| Tier   | 설명 | 접근 가능 기능 |
|--------|------|--------------|
| Tier 0 | 이메일/핸드폰 인증 가입 | 피드 열람, 지식 열람 |
| Tier 1 | 반려동물 인증 사용자 | + 피드 작성, 산책 게시글 열람/작성 |
| Tier 2 | 반려동물 신뢰 사용자 | + 산책 신청/매칭/채팅, 위탁 기능 |

- JWT 토큰에는 `userId`, `tier`만 포함
- `permissions`는 토큰에 넣지 않음 → 서버에서 `UserTier#permissions()`로 산출
- 컨트롤러에는 `@RequirePermission` 어노테이션으로 권한 검사

---

## 피드 시스템 핵심 설계

### 커서 기반 페이징

- 커서 조건: `createdAt < cursorCreatedAt OR (createdAt = cursorCreatedAt AND id < cursorId)`
- 첫 페이지: `createdAt DESC, id DESC` 단순 정렬
- 이후 페이지: 커서 포함 조건으로 연속 조회
- 클라이언트는 `MAX_HOME_FEED_PAGES_IN_MEMORY = 6` 페이지까지만 메모리 유지

### 배치 쿼리 전략 (페이지당 6쿼리)

1. 게시글 목록 (커서 쿼리)
2. 이미지 목록 (IN 절 일괄 조회)
3. 해시태그 목록 (IN 절 일괄 조회)
4. 발자국(paw) 수 (IN 절 일괄 조회)
5. 현재 사용자 발자국 여부 (IN 절 일괄 조회)
6. 작성자 프로필 (IN 절 일괄 조회)

N+1 쿼리 절대 금지. JPA 연관관계 lazy 로딩 후 배치 조회로 대체.

### 광고 주입

- 현재: 클라이언트 사이드에서 4게시글마다 광고 슬롯 삽입
- 광고 컨트랙트: `HomeFeedAd { adId, campaignId, slotKey, tracking }`
- impression/click 이벤트 별도 추적

---

## MVP 범위

### 포함 (MVP)
1. **SNS 피드**: 반려동물 프로필 기반 성장 기록 (사진/텍스트/해시태그), 피드 조회, 발자국/댓글/북마크
2. **산책 매칭**: 산책 모집글 생성/참여/취소, 동네 기반 노출
3. **위탁 매칭**: 위탁 의뢰/수락/거절/취소, 최소 안전장치 (신고/차단)
4. **지식/가이드**: 반려동물 종류별 건강검진/주의사항 (의료 진단 아닌 정보 제공)

### 제외 (후속)
- 결제/정산 (위탁 유료화)
- 실시간 채팅
- 동물병원/용품 상점 제휴
- AI 사진 분석, 추천 알고리즘 고도화

---

## 코딩 컨벤션 및 규칙

### Backend

- **레이어 의존성 방향 엄수**: Domain ← Application ← Adapter (역방향 절대 금지)
- **포트(인터페이스) 통한 의존**: 서비스는 Repository 구현체가 아닌 Port Out 인터페이스에 의존
- **트랜잭션 경계**: Application 레이어(Service)에서만 선언
- **도메인 모델 순수성**: Domain 패키지에 JPA 어노테이션, Spring 의존 없이 유지 (장기 목표)
- **DTO 매핑**: Adapter 레이어에서만 수행, 도메인 객체를 Controller까지 노출하지 않음
- **에러 응답 규격**:
  - 401: `{"code":"UNAUTHORIZED","message":"...","path":"...","timestamp":"..."}`
  - 403: `{"code":"FORBIDDEN","message":"...","path":"...","timestamp":"..."}`
- **보안**: 토큰/비밀번호 평문 저장 절대 금지 (해시 저장 필수)
- **페이징**: 피드/목록 API는 커서 기반 페이징 우선
- **N+1 주의**: JPA 연관관계 fetch 전략 명시, 복잡한 조회는 JPQL/쿼리 직접 작성

### Backend 테스트 전략 (3-Layer)

| 레이어 | 범위 | 사용 기술 |
|------|------|---------|
| Controller 테스트 | HTTP 요청/응답, 인증, 권한 | `@WebMvcTest`, `MockMvc` |
| Service 테스트 | 비즈니스 로직, 도메인 규칙 | JUnit, Mockito |
| Repository 테스트 | 쿼리 정확성, 인덱스 활용 | `@DataJpaTest`, H2 |

- 외부 의존(메일, OAuth)은 Mock 처리
- 통합 테스트는 핵심 흐름(가입, 로그인, 피드 조회)에 집중

### Frontend

- **클래스 네이밍**: JSX에 Tailwind utility 나열 최소화, semantic class name 우선
  - 예: `onboarding-profile-step-panel`, `feed-detail-menu-trigger`
  - 구조적 스타일은 `web/app/globals.css`의 `@layer components`로 이동
- **컴포넌트 분리 원칙**:
  - 단일 책임, 최소 단위로 분리
  - 페이지 컴포넌트 역할: 라우팅, API 호출, 상태 orchestration, 단계 흐름 제어만
  - 큰 UI 블록 (진행바, 단계 패널, 모달, 재사용 필드)은 별도 컴포넌트로 분리
- **상태 관리 최소화**: 불필요한 전역 상태 지양, 서버 상태는 React Query로 관리
- **검증**: 프론트 변경 후 `npx tsc --noEmit` 실행

### 디자인 시스템

- **톤앤매너**: 따뜻하고 차분하며 신뢰감 있는 느낌 (과도한 귀여움 지양)
- **색상 팔레트**:
  - `ink`: 주요 텍스트/요소 (어두운 계열)
  - `sand`: 배경 (따뜻한 베이지)
  - `pine`: 주요 액션 (녹색 계열)
  - `moss`: 보조 녹색
  - `clay`: 중성 갈색
  - `ember`: 위험/경고 (붉은 계열)
  - `sky`: 정보성 (파란 계열)
- **폰트**: 디스플레이 `Space Grotesk`, 본문 `SUIT`
- **라운드**: 전반적으로 큰 라운드 (`rounded-2xl`, `rounded-full`, `28-32px`)
- **카드**: 반투명 흰색 + 은은한 border + 부드러운 shadow
- **다크 플로팅 패널**: 컨텍스트 메뉴/alert 카드에만 사용하는 별도 계열
- **모션**: fade/slide 위주, 과한 애니메이션 금지
- **다크모드**: 베이스 slate-800(#1e293b), CSS 변수 semantic token 전략 사용

---

## 커밋 규칙

- 커밋 메시지는 **한글**로 작성
- 형식: `type(scope): 설명`
- 기능 단위로 별도 커밋 (한 번에 여러 기능이면 분리)

### type 목록
| type | 설명 |
|------|------|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩터링 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 |
| `chore` | 빌드/설정 |
| `style` | 포맷/스타일 |

### 예시
```
feat(feed): 피드 해시태그 필터 기능 추가
fix(auth): 리프레시 토큰 만료 후 재로그인 처리 수정
refactor(onboarding): 프로필 온보딩 페이지를 단계별 컴포넌트로 분리
```

---

## 브랜치 전략

```
feature → develop → release
```

| 브랜치    | 용도 |
|---------|------|
| `feature/*` | 기능 개발 |
| `develop`   | 통합 개발 |
| `release`   | 배포 트리거 (GitHub Actions → Docker Hub → EC2) |

---

## 문서 위치

- `/docs/claude_docs/README.md` — 프로젝트 개요
- `/docs/claude_docs/tech-stack.md` — 기술 스택 상세
- `/docs/claude_docs/server-package-tree.md` — 서버 패키지 구조
- `/docs/claude_docs/migration/` — DB 마이그레이션 SQL 및 컨벤션
- `/docs/claude_docs/codex_docs/backend/docs/` — 백엔드 상세 문서
- `/docs/claude_docs/codex_docs/frontend/docs/` — 프론트엔드 가이드
- `/docs/claude_docs/roles/` — 역할별 작업 프롬프트

---

## 기타 원칙

- **API 명세 우선**: 각 API는 명세서 작성 후 구현 (Contract-First)
- **보안은 기본값**: 보안/개인정보 처리는 후순위가 아님
- **동네 위치**: 정밀 주소가 아닌 대략적 범위 (동/읍/면) 기준
- **미디어**: DB 저장 금지, 객체 스토리지(S3) + CDN 사용
- **발자국/참여**: 유니크 제약 + 멱등성 보장
- **상태 전이**: 명시적 State Machine 또는 엄격한 도메인 메서드로 통제
