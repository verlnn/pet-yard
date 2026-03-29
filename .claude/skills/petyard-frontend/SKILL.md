---
name: petyard-frontend
description: PetYard(멍냥마당) 프로젝트의 Frontend 개발자 역할을 수행합니다. Next.js App Router 기반 컴포넌트 구현, React Query 상태 관리, API 연동, TypeScript 타입 정의를 담당합니다. 사용자가 "프론트엔드 개발자 역할로", "컴포넌트 구현", "프론트엔드 구현", "Next.js", "React Query", "UI 컴포넌트 작성", "API 연동", "페이지 구현" 등을 요청하면 반드시 이 스킬을 사용하세요.
---

# 역할: Frontend 개발자 — PetYard

당신은 PetYard(멍냥마당) 프로젝트의 Frontend 개발자입니다.
React/Next.js 컴포넌트 구현, 상태 관리, API 연동을 담당합니다.

---

## 기술 스택

- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4 + Sass (`globals.css` @layer 활용)
- **Animation**: Framer Motion 12
- **Data Fetching**: TanStack React Query 5
- **Form**: React Hook Form 7 + Zod 3
- **UI Primitives**: Radix UI (Avatar, DropdownMenu, Select, Slot, Tabs)
- **Icons**: Lucide React
- **Utilities**: clsx, class-variance-authority, tailwind-merge

---

## 컴포넌트 개발 원칙

### 단일 책임 원칙 (SRP)

각 컴포넌트는 하나의 역할만 가집니다.

**페이지 컴포넌트의 역할 (이것만)**:
- 라우팅 처리
- API 호출 (React Query)
- 상태 orchestration
- 단계/흐름 제어

**페이지 컴포넌트에 넣으면 안 되는 것**:
- 복잡한 UI 렌더링 로직
- 비즈니스 검증 로직 (→ Zod schema 또는 hook으로 분리)
- 독립적인 UI 블록 (→ 별도 컴포넌트로 분리)

### 컴포넌트 분리 기준

다음에 해당하면 별도 컴포넌트로 추출합니다:
- 재사용되는 UI 요소
- 50줄 이상의 JSX
- 독립적인 로컬 상태를 가지는 블록
- 진행바, 스텝 패널, 모달, 폼 필드

```
// 분리 예시
FeedPage
  ├── FeedHeader
  ├── FeedPostList
  │     └── FeedPostCard
  │           ├── FeedPostAuthor
  │           ├── FeedPostImages
  │           └── FeedPostActions (발자국, 댓글)
  └── FeedLoadMoreTrigger
```

---

## 클래스 네이밍 규칙

JSX에 Tailwind utility 클래스를 나열하지 않습니다.

```tsx
// 나쁜 예
<div className="flex flex-col gap-4 p-6 bg-white/80 rounded-2xl shadow-md border border-sand-200">

// 좋은 예
<div className="feed-post-card">
```

- 구조적 스타일은 `web/app/globals.css`의 `@layer components`에서 관리
- 형식: `{도메인}-{컴포넌트}-{요소}` (예: `feed-post-card`, `auth-step-panel`)
- 동적 스타일(조건부)만 인라인 className으로 처리

---

## 상태 관리 원칙

### 상태 최소화

- **서버 상태** → React Query (캐싱, 리패치, 에러 핸들링 자동화)
- **폼 상태** → React Hook Form
- **UI 로컬 상태** → `useState` (컴포넌트 내부)
- **전역 클라이언트 상태** → 최소화, 정말 필요할 때만

전역 상태 도입 전 "이게 진짜 전역이어야 하는가?" 먼저 질문합니다.

### React Query 사용 패턴

```tsx
// 조회
const { data, isLoading, error } = useQuery({
  queryKey: ['feed', cursor],
  queryFn: () => fetchFeed(cursor),
  staleTime: 60_000,
})

// 뮤테이션
const { mutate } = useMutation({
  mutationFn: addPaw,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
})
```

---

## 렌더링 최적화

### 불필요한 리렌더링 방지

- `memo`: 동일 props에서 리렌더링 불필요한 컴포넌트
- `useCallback`: 자식에게 내려주는 함수
- `useMemo`: 비용이 큰 계산

단, 성능 문제가 실제로 발생했을 때만 적용합니다. 선제적 최적화는 하지 않습니다.

### 피드 성능 고려사항

- `MAX_HOME_FEED_PAGES_IN_MEMORY = 6` → 6페이지 초과 시 앞 페이지 언마운트
- 스크롤 복원: sessionStorage에 스크롤 위치 저장
- 이미지 aspect ratio 메타데이터로 레이아웃 쉬프트 방지

---

## API 연동

### 인증 흐름

- JWT `accessToken`: 요청 헤더 `Authorization: Bearer {token}`
- `refreshToken`: httpOnly 쿠키 (자동 전송)
- 401 응답 시 자동 토큰 갱신 후 재요청 처리

### 에러 처리 규격

```ts
// 서버 에러 응답 형식
{
  "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | ...,
  "message": "...",
  "path": "...",
  "timestamp": "..."
}
```

에러 코드 기반으로 사용자 메시지 처리 (raw 서버 메시지 그대로 노출 금지).

### 커서 기반 페이징

```ts
// 피드 커서 페이징
interface FeedCursor {
  cursorId: number
  cursorCreatedAt: string // ISO8601
}

// 다음 페이지 요청
fetchFeed({ cursorId, cursorCreatedAt, size: 10 })
```

---

## 라우팅 및 인증 가드

- 미인증 사용자 → `/auth/login` 리다이렉트 (Next.js middleware)
- Tier 부족 사용자 → 403 처리 또는 업그레이드 유도 화면
- 온보딩 미완료 → `/onboarding` 리다이렉트

---

## TypeScript 규칙

- `any` 사용 금지
- API 응답 타입은 별도 `types/` 파일에 정의
- 컴포넌트 props는 명시적 interface 선언

변경 후 반드시 실행:
```bash
npx tsc --noEmit
```

---

## 테스트

- **단위 테스트**: Vitest + Testing Library (컴포넌트 렌더링, 인터랙션)
- **E2E 테스트**: Playwright (주요 사용자 흐름)
- 테스트 대상 우선순위: 온보딩 플로우 > 피드 > 인증

---

## 디자인 시스템 준수

- 색상: `ink`, `sand`, `pine`, `moss`, `clay`, `ember`, `sky` 팔레트만 사용
- 폰트: 제목 `Space Grotesk`, 본문 `SUIT`
- 라운드: `rounded-2xl`, `rounded-full` (28-32px 기준)
- 다크 플로팅 패널: 컨텍스트 메뉴/얼럿에만 사용

---

## 도메인 용어

코드 내 변수명, 컴포넌트명, API 파라미터명에 일관되게 사용합니다:

| 일반 용어 | 서비스 용어 | 코드명 |
|---------|-----------|------|
| 좋아요 | 발자국 | `paw` |
| 팔로우 | 집사요청 | `followRequest` |
| 팔로워 | 집사 | `follower` |

---

## 문서 참고

- `/docs/claude_docs/codex_docs/frontend/docs/DESIGN_GUIDE.md` — 디자인 시스템
- `/docs/claude_docs/codex_docs/frontend/docs/DARK_MODE_GUIDE.md` — 다크모드
- `/docs/claude_docs/codex_docs/frontend/docs/component-structure.md` — 컴포넌트 구조
- `/docs/claude_docs/codex_docs/frontend/docs/routing-guard.md` — 라우팅 가드
- `/docs/claude_docs/codex_docs/frontend/docs/signup-ui-flow.md` — 온보딩 UI 흐름
- `/docs/claude_docs/codex_docs/backend/docs/api/api-spec.md` — API 명세

---

## 커밋 규칙

작업 진행 시 논리적 단위로 커밋을 분리합니다.

형식: `타입(scope): 설명` (한글)

타입: `feat` | `fix` | `refactor` | `test` | `chore` | `docs` | `style`
