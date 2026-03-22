# 피드 아키텍처

## 개요

홈 피드는 인스타그램형 무한 스크롤 타임라인이며, 다음 제약을 기준으로 설계되어 있습니다.

- 이미지 카드 높이가 가변적임
- 사용자가 한 세션에서 오래 스크롤할 수 있음
- 광고는 아직 서버가 아니라 클라이언트에서 삽입함

그래서 현재 구조는 아래 조합을 사용합니다.

- 백엔드 cursor pagination 기반 `GET /api/feeds`
- 프론트 `useInfiniteQuery`
- 하단 sentinel + `IntersectionObserver`
- 메모리 상한을 두는 `maxPages`
- 페이지 단위 배치 조회

현재 단계에서 구현 복잡도를 과도하게 올리지 않으면서도, 이후 광고/추천/성능 고도화에 대응할 수 있도록 한 구조입니다.

## 요청 흐름

### 백엔드

`GET /api/feeds`

요청 파라미터:

- `cursorCreatedAt`
- `cursorId`
- `limit`

정렬 기준:

- `createdAt desc`
- `id desc`

페이지네이션 방식:

- 첫 페이지: 커서 없이 최신 게시물부터 조회
- 다음 페이지: 마지막 게시물보다 오래된 게시물만 조회
- `pageSize + 1`개를 조회
- 한 개 더 있으면 `hasMore = true`

실제 페이지 크기 결정은 `FeedProperties.resolvePageSize(...)`에서 처리합니다.

현재 정책:

- 기본 페이지 크기: `app.feed.initial-load-size`
- 최대 페이지 크기: `app.feed.max-load-size`
- 잘못된 요청값(`null`, `0`, 음수): 기본값 사용
- 과도한 요청값: 최대값으로 clamp

### 데이터 조립 방식

서비스는 먼저 게시물 slice를 조회한 뒤, 그 slice에 대해서만 연관 데이터를 배치 조회합니다.

- 게시물 이미지
- 좋아요 수
- 현재 로그인 사용자의 좋아요 여부
- 해시태그
- 작성자 프로필

읽기 모델은 아래처럼 역할을 분리했습니다.

- `HomeFeedAuthorView`
- `HomeFeedMediaView`
- `HomeFeedReactionView`
- `HomeFeedPostView`

외부 API 응답은 프론트 호환성을 위해 기존 flat 형태를 유지하지만, 내부 모델은 확장에 유리한 구조로 바꿨습니다.

## 왜 Cursor Pagination을 쓰는가

소셜 피드는 offset pagination과 궁합이 좋지 않습니다. 데이터가 계속 위에 삽입되기 때문에, 스크롤 중간에 중복/누락이 생길 가능성이 있고, offset이 커질수록 비용도 커집니다.

cursor pagination이 적합한 이유:

- 사용자가 보는 정렬 순서와 동일한 기준으로 이어짐
- 큰 offset scan을 피할 수 있음
- 상단에 새 게시물이 생겨도 이어보기 안정성이 높음
- `createdAt` 동률을 `id`로 보정할 수 있음

현재 커서 규칙:

- `createdAt < cursorCreatedAt`
- 또는 `createdAt = cursorCreatedAt and id < cursorId`

이 규칙 덕분에 같은 시각에 생성된 게시물이 있어도 순서가 안정적으로 유지됩니다.

## 왜 아직 Virtualization을 도입하지 않았는가

전체 virtualization은 의도적으로 아직 도입하지 않았습니다.

이유:

- 카드 높이가 가변적임
- 피드 카드가 비교적 풍부한 UI와 인터랙션을 가짐
- 광고 카드가 중간에 섞임
- virtualization을 넣으면 측정, 스크롤 복원, 삽입형 아이템 처리 복잡도가 커짐

대신 현재는 아래 조합으로 현실적인 균형을 잡았습니다.

- cursor pagination
- `IntersectionObserver` 기반 preload
- `maxPages` 기반 메모리 상한
- lazy image loading
- media container에 aspect ratio를 부여해서 layout shift 완화

현재 규모에서는 이 조합이 더 단순하고 운영 리스크도 낮습니다.

## 프론트 쿼리 전략

프론트는 아래 유틸을 기준으로 동작합니다.

- `buildHomeFeedQueryKey(accessToken)` : 사용자별 캐시 분리
- `getHomeFeedNextPageParam(...)` : API 응답을 React Query next page param으로 변환
- `shouldRequestNextHomeFeedPage(...)` : observer 재호출 방어 조건 통합

다음 페이지 요청 조건:

- sentinel이 intersect 상태
- `hasNextPage = true`
- 이미 다음 페이지 요청 중이 아님
- 로컬 fetch lock이 걸려 있지 않음

특히 fetch lock은 React Query의 `isFetchingNextPage`가 반영되기 전에 observer callback이 중복 호출되는 상황을 막기 위해 둔 장치입니다.

## 메모리와 UX 트레이드오프

`maxPages`는 의도적으로 제한되어 있습니다.

장점:

- 장시간 스크롤 시 메모리 증가를 억제
- 큰 React tree가 계속 남는 것을 방지
- 캐시 객체 수를 제한

단점:

- 사용자가 한참 아래까지 내려갔다가 나중에 다시 돌아오면, 오래된 페이지는 재요청될 수 있음

현재 서비스 단계에서는 허용 가능한 트레이드오프로 판단했습니다. 이 점은 query 설정 파일에 주석으로 남겨 두었습니다.

## 광고 삽입 구조

현재 서버는 게시물만 반환합니다.

클라이언트는:

- 순수 게시물 목록

을 받아서

- 렌더링용 혼합 목록(`post | ad`)

으로 변환합니다.

현재 규칙:

- 게시물 4개마다 광고 1개 삽입
- 페이지 기준이 아니라 누적 피드 전체 기준으로 계산

이렇게 해야 새 페이지가 붙을 때 광고 위치가 흔들리지 않습니다.

## 향후 확장 방향

### 서버 주도 광고

향후 서버가 sponsored item을 내려주기 시작하더라도, 프론트의 최종 렌더 계약은 유지하는 것이 좋습니다.

- 최종 렌더링 대상은 하나의 union list

권장 전환 방식:

1. `HomeFeedListItem`을 렌더링 계약으로 유지
2. 서버 sponsored row를 같은 union type으로 변환하는 adapter 추가
3. sponsored item이 존재하면 현재 fallback 광고 삽입을 비활성화

### 추천 피드 확장

현재 구조는 아래 방향의 확장에 대응하기 쉽게 설계했습니다.

- 팔로우 그래프 기반 추천
- 지역 기반 추천
- 반려동물 프로필 기반 추천
- 광고 실험/랭킹 실험

핵심은 “시간순 slice 조회”와 “페이지 단위 배치 조립” 경계를 유지하는 것입니다. 이 경계를 보존하면 이후 추천 신호가 커져도 전체 구조를 무너뜨리지 않고 확장할 수 있습니다.

## 관련 문서

- `docs/feed-query-strategy.ko.md`
- `docs/feed-image-strategy.ko.md`
- `docs/feed-observability.ko.md`
- `docs/feed-max-pages-ux.ko.md`
- `docs/feed-ad-contract.ko.md`
- `docs/feed-recommendation-roadmap.ko.md`
