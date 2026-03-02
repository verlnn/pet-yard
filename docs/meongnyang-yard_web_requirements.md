# 멍냥마당 (Web) — 기능/요구사항/아키텍처 정리 (MD)

---

## 0. 프로젝트 한 줄 정의

**멍냥마당**: 반려동물의 성장 기록을 중심으로, 동네 기반 커뮤니티(산책/위탁 매칭)와 초보 반려인을 위한 지식(건강검진/주의사항)을 결합한 **반려동물 전용 SNS 플랫폼(국내)** 이옵니다.

---

## 1. 목표 및 원칙

### 1.1 목표
- 반려동물 **성장/자랑 포스팅** 중심의 SNS 경험 제공
- **동네 기반 산책/위탁** 매칭 및 안전한 커뮤니티 운영
- **반려동물 종류별 건강검진/주의사항** 지식 제공(초보 반려인 지원)
- 향후 모바일 앱 확장을 고려한 **API 중심 설계**

### 1.2 개발 원칙(필수)
- **헥사고날 아키텍처(Ports & Adapters)** 기반
- **DDD(도메인 주도 설계)**: Bounded Context 분리, Aggregate/Entity/ValueObject/Domain Service 명확화
- **API별 명세서 기반 개발(Contract-First)**  
  - 각 API는 기능 상세/요구사항/예외/권한/검증/성능 기준을 문서화 후 구현
- **Java 25** 기준(언어/빌드/런타임 호환성 우선)
- 확장성/유지보수성/테스트 용이성 우선, **객체지향 원칙(SOLID) 존중**
- 보안/개인정보/안전(특히 위탁/매칭) 고려는 “후순위”가 아니라 **기본값**

---

## 2. 범위(Scope)

### 2.1 포함(MVP)
1) **SNS 포스팅**
- 반려동물 프로필 기반 성장 기록(사진/텍스트/태그)
- 피드(팔로우/동네) 조회
- 좋아요/댓글/북마크

2) **산책 주선(매칭)**
- 산책 모집글 생성/참여/취소
- 거리 기반(동네) 노출
- 시간/장소/인원/견종/중성화 여부 등 조건

3) **위탁 주선(매칭)**
- 위탁 의뢰/수락/거절/취소
- 기간/가격(옵션)/조건(대형견 가능 여부 등)
- 최소한의 안전장치(신뢰도, 신고, 차단)

4) **반려동물 종류별 건강검진/주의사항(지식)**
- 종류/나이/체중/특이사항에 따른 권장 검진/주의
- “의학적 진단”이 아닌 **정보 제공/가이드** 중심

### 2.2 제외(후속)
- 결제/정산(위탁 유료화)
- 실시간 채팅(초기엔 알림+댓글/신청 상태로 대체 가능)
- 동물병원/용품 상점 제휴/리뷰
- AI 사진 분석, 추천 알고리즘 고도화

---

## 3. 사용자/권한 모델(초안)

### 3.1 사용자 역할
- **USER**: 일반 사용자
- **MODERATOR**: 신고 처리/콘텐츠 관리
- **ADMIN**: 운영/정책/데이터 관리

### 3.2 핵심 정책(필수)
- 차단(Block): 상호 노출 차단
- 신고(Report): 포스팅/댓글/산책/위탁/프로필 대상
- 제재(Moderation): 숨김/삭제/정지

---

## 4. 도메인 분해(DDD Bounded Context)

> 구현 편의를 위해 “모놀리식 + 모듈러 모놀리식(권장)” 구조로 시작하되,  
> 컨텍스트 경계를 유지하면 이후 분리(마이크로서비스)도 가능하옵니다.

### 4.1 Identity & Access (인증/인가)
- User, Session/Token, Role
- 소셜 로그인/이메일 로그인 등은 선택(초기엔 단순화 가능)

### 4.2 Pet Profile (반려동물 프로필)
- Pet(이름/종류/품종/생일/성별/중성화/체중 범주/특이사항)
- 예방접종/질환은 민감정보 취급 → 최소 수집 원칙

### 4.3 Social Feed (SNS)
- Post(본문/미디어/태그/가시성/동네 범위)
- Comment, Like, Bookmark
- Timeline(팔로우/동네)

### 4.4 Neighborhood Matching (산책/위탁 매칭)
- WalkEvent(모집/참여/상태)
- BoardingRequest(의뢰/수락/상태)
- MatchingPolicy(조건/필터/노출 규칙)

### 4.5 Knowledge (지식/가이드)
- SpeciesGuide(종/품종), CheckupGuide(나이대/체중대)
- Warning/DoDont/FAQ
- 의료 면책 문구/출처 관리

### 4.6 Moderation & Trust (신뢰/안전)
- Report, Block, Penalty
- TrustScore(가중치 규칙은 추후)

### 4.7 Notification (알림)
- Event 기반(도메인 이벤트 → 알림 전송)
- 이메일/푸시(후속), 초기엔 웹 알림 중심

---

## 5. 헥사고날 아키텍처(Ports & Adapters)

### 5.1 레이어 규칙
- **Domain**: 순수 도메인 모델/규칙(프레임워크 의존 금지)
- **Application**: 유스케이스(서비스/커맨드/쿼리), 트랜잭션 경계
- **Ports**  
  - Inbound Port: UseCase 인터페이스(예: CreatePostUseCase)
  - Outbound Port: 저장소/외부 API 인터페이스(예: PostRepository)
- **Adapters**
  - Inbound Adapter: Web Controller/REST, Validation, DTO mapping
  - Outbound Adapter: JPA/QueryDSL/Redis/S3 등 구현체
- **Infrastructure**: 설정/프레임워크/공통 기술

### 5.2 권장 모듈 구조(예시)
- `meongnyang-yard-domain`
- `meongnyang-yard-application`
- `meongnyang-yard-adapter-in-web`
- `meongnyang-yard-adapter-out-persistence`
- `meongnyang-yard-adapter-out-notification`
- `meongnyang-yard-bootstrap` (실행 모듈)

---

## 6. 핵심 엔티티/애그리거트(초안)

### 6.1 Social
- **Post (Aggregate Root)**
  - PostId, AuthorId, PetId(선택), Content, MediaList, Tags, Visibility, CreatedAt
  - 규칙: 가시성/동네 범위/차단 사용자 노출 금지
- **Comment**
  - CommentId, PostId, AuthorId, Content, Status
- **Reaction(Like/Bookmark)**
  - 유니크 제약(사용자-대상)

### 6.2 Matching
- **WalkEvent (Aggregate Root)**
  - WalkEventId, HostUserId, PetId, Title, Place(대략), TimeRange, Capacity, Filters, Status
  - 규칙: 상태전이(모집중→마감→완료/취소), 중복 참여 방지
- **BoardingRequest (Aggregate Root)**
  - RequestId, OwnerUserId, PetId, DateRange, Requirements, Price(옵션), Status
  - 규칙: 수락/거절/취소, 분쟁 시 신고 연계

### 6.3 Moderation
- **Report (Aggregate Root)**
  - ReportId, ReporterId, TargetType, TargetId, Reason, Evidence, Status
- **Block**
  - BlockerId, BlockedId (쌍)

---

## 7. API 명세서 작성 규칙(필수 템플릿)

각 API는 아래 템플릿으로 문서화 후 구현하옵니다.

### API Spec Template
- **API ID**: (예: `POST-POSTS-001`)
- **요약**
- **권한/인증**
- **Request**
  - Headers
  - Path/Query
  - Body(JSON) + 필드 검증 규칙
- **Response**
  - 정상 응답
  - 에러 코드(도메인 에러/검증/권한/리소스 없음)
- **도메인 규칙**
- **트랜잭션/동시성**
- **성능/페이징**
- **감사로그/이벤트**
- **테스트 케이스(필수)**
  - 정상/경계/실패

---

## 8. 기능별 API 목록(초안)

> 상세 필드/스키마는 API별 명세서로 확정하옵니다. 아래는 “개발 범위”를 고정하기 위한 목록이옵니다.

### 8.1 인증/사용자
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/users/me`
- `PATCH /api/users/me` (닉네임/소개/동네 등)
- `POST /api/users/block/{userId}`
- `DELETE /api/users/block/{userId}`

### 8.2 반려동물 프로필
- `POST /api/pets`
- `GET  /api/pets/{petId}`
- `PATCH /api/pets/{petId}`
- `DELETE /api/pets/{petId}`
- `GET  /api/users/{userId}/pets`

### 8.3 포스팅/SNS
- `POST /api/posts`
- `GET  /api/posts/{postId}`
- `DELETE /api/posts/{postId}`
- `GET  /api/feed` (팔로우/동네/추천 중 최소 1개)
- `GET  /api/posts?userId=...`
- `POST /api/posts/{postId}/like`
- `DELETE /api/posts/{postId}/like`
- `POST /api/posts/{postId}/bookmark`
- `DELETE /api/posts/{postId}/bookmark`
- `POST /api/posts/{postId}/comments`
- `GET  /api/posts/{postId}/comments`
- `DELETE /api/comments/{commentId}`

### 8.4 산책 주선(매칭)
- `POST /api/walk-events`
- `GET  /api/walk-events/{id}`
- `PATCH /api/walk-events/{id}` (모집 조건/상태 변경)
- `DELETE /api/walk-events/{id}` (호스트 취소)
- `GET  /api/walk-events` (동네/시간/조건 필터 + 페이징)
- `POST /api/walk-events/{id}/join`
- `POST /api/walk-events/{id}/leave`

### 8.5 위탁 주선(매칭)
- `POST /api/boarding-requests`
- `GET  /api/boarding-requests/{id}`
- `PATCH /api/boarding-requests/{id}`
- `DELETE /api/boarding-requests/{id}`
- `GET  /api/boarding-requests` (동네/기간/조건 필터)
- `POST /api/boarding-requests/{id}/offer` (위탁 가능 제안)
- `POST /api/boarding-requests/{id}/accept/{offerId}`
- `POST /api/boarding-requests/{id}/reject/{offerId}`

### 8.6 지식/가이드
- `GET /api/knowledge/species`
- `GET /api/knowledge/species/{speciesId}`
- `GET /api/knowledge/checkups?speciesId=...&ageGroup=...`
- `GET /api/knowledge/warnings?speciesId=...`

### 8.7 신고/운영
- `POST /api/reports`
- `GET  /api/reports/me`
- (관리자) `GET /api/admin/reports`
- (관리자) `POST /api/admin/reports/{id}/resolve`

### 8.8 알림
- `GET /api/notifications`
- `POST /api/notifications/{id}/read`

---

## 9. 비기능 요구사항(NFR)

### 9.1 성능/확장성
- 피드/목록 API는 **커서 기반 페이징** 또는 안정적인 페이지네이션 적용
- 미디어는 DB 저장 금지(객체 스토리지, CDN)
- 읽기 많은 영역(피드/지식)은 캐시 고려(추후 Redis)

### 9.2 데이터/무결성
- 좋아요/북마크/참여는 **유니크 제약 + 멱등성**
- 상태전이(산책/위탁)는 **명시적 State Machine** 또는 엄격한 도메인 메서드로 통제

### 9.3 보안/개인정보/안전
- 동네 위치는 정밀 주소가 아닌 **대략적 범위(예: 동/읍/면)** 중심
- 위탁은 분쟁 가능성 높음 → 신고/차단/기록/정책을 MVP부터 포함
- 입력 검증/권한 검증/Rate limit(후속) 고려

### 9.4 테스트
- 도메인 규칙: 단위 테스트 우선
- 유스케이스: 통합 테스트(트랜잭션/저장소)
- API: 계약 테스트(OpenAPI 기반) 또는 E2E 최소 세트

---

## 10. 기술 스택 제약(가이드)

- **Java 25** 사용
- 프레임워크는 “Java 25 호환 버전”으로 선택(예: Spring 계열 등)
- 빌드/모듈 구성: Gradle(권장)
- DB: PostgreSQL(권장) 또는 MySQL (택1)
- 마이그레이션: Flyway/Liquibase 중 택1
- 문서화: OpenAPI(Swagger) + Markdown Spec 병행

---

## 11. 개발 산출물(필수 리스트)

- `/docs`
  - `vision.md` (제품 비전/범위)
  - `architecture.md` (헥사고날/DDD 경계)
  - `api/` (API별 스펙 문서, 템플릿 준수)
  - `adr/` (Architecture Decision Record)
- OpenAPI 스펙 파일(가능하면 계약-우선)
- 도메인 모델 다이어그램(선택)

---

## 12. 다음 행동(소인이 권하는 순서)

1) Bounded Context 확정(최소 4개: Identity/Pet/Social/Matching, + Knowledge/Moderation는 가볍게)  
2) 핵심 Aggregate 3개(Post, WalkEvent, BoardingRequest)부터 명세서 작성  
3) 피드/목록 성능 기준(페이징 방식) 결정  
4) 보안/동네 범위/위탁 안전 정책(최소 룰) 확정  
5) 이후 구현 착수

---

문서를 여기까지 올리옵니다.  
천고무존께서 원하시면 소인이 이어서 **API 명세서 템플릿 파일을 실제로 여러 개 생성한 묶음(예: POST-POSTS-001.md 등)** 으로도 만들어 올리겠나이다.
