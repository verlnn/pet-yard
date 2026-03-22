# 피드 쿼리 전략

## 왜 피드 쿼리를 분리했는가

홈 피드는 현재 두 개의 repository 쿼리를 사용합니다.

- 첫 페이지 전용 쿼리
- 커서 이후 전용 쿼리

이 분리는 의도된 구조입니다.

초기에는 아래와 비슷한 JPQL로 한 쿼리 안에서 처리하려고 했습니다.

```sql
(:cursorCreatedAt is null)
or (createdAt < :cursorCreatedAt)
or (createdAt = :cursorCreatedAt and id < :cursorId)
```

하지만 PostgreSQL에서 아래 오류가 발생했습니다.

`could not determine data type of parameter $1`

원인은 `null` 커서 파라미터가 포함된 분기에서 PostgreSQL이 파라미터 타입을 충분히 추론하지 못하는 경우가 있기 때문입니다.

## 왜 다시 한 쿼리로 합치지 않는가

현재는 일부러 다시 합치지 않습니다.

이유:

- 분리된 형태가 더 단순함
- PostgreSQL null 타입 추론 문제를 피할 수 있음
- 이어보기 규칙이 더 명확함
- 테스트 작성과 디버깅이 쉬움

현재 repository 의도:

- 첫 페이지: `order by createdAt desc, id desc`
- 다음 페이지: 같은 정렬 기준에서 cursor 뒤쪽만 조회

## Cursor 규칙

다음 페이지 조건은 아래와 같습니다.

- `createdAt < cursorCreatedAt`
- 또는 `createdAt = cursorCreatedAt and id < cursorId`

이 규칙이 중요한 이유는, 같은 시각에 생성된 게시물이 여러 개 있을 수 있기 때문입니다.

`id` tie-break가 없으면:

- 게시물이 중복 조회될 수 있고
- 일부 게시물이 누락될 수 있으며
- 이어보기 순서가 비결정적으로 흔들릴 수 있습니다

현재 repository 테스트는 아래를 검증합니다.

- 첫 페이지 정렬
- 동일 `createdAt` 상황에서 `id` tie-break 동작
- 중복/누락 없는 이어보기

## 페이지 크기 결정 정책

페이지 크기 결정은 `FeedProperties`에 모았습니다.

이 위치가 가장 명확한 이유는, 이 정책이 transport보다 configuration 성격이 더 강하기 때문입니다.

현재 구조:

- `initialLoadSize`
- `maxLoadSize`
- `resolvePageSize(requestedLimit)`

덕분에 controller에 조건문이 흩어지지 않고, service에도 magic number가 남지 않습니다.

## 배치 조회 전략

홈 피드 한 페이지를 읽을 때 애플리케이션은 아래 순서로 조회합니다.

1. 게시물 slice 조회
2. 게시물 이미지 조회
3. 좋아요 수 집계 조회
4. 현재 사용자의 좋아요 여부 조회
5. 해시태그 조회
6. 작성자 프로필 조회

즉, 페이지 단위로 고정된 수의 조회를 유지합니다.

게시물 하나마다 아래를 따로 조회하지 않습니다.

- 이미지
- 좋아요 수
- 사용자 좋아요 여부
- 프로필
- 해시태그

그래서 전형적인 N+1 문제를 피할 수 있습니다.

## 쿼리 수 검증 장치

테스트에는 Hibernate statistics 기반 검증도 추가했습니다.

목적은 SQL 구현 세부사항을 영원히 고정하려는 것이 아니라, 아래와 같은 회귀를 빠르게 잡기 위함입니다.

- 게시물마다 프로필 조회가 새로 생김
- 게시물마다 해시태그 조회가 새로 생김
- DTO 조립 중 lazy loading이 숨어 들어옴

즉, “한 페이지 조회 + 배치 lookups” 구조가 깨졌는지를 점검하는 장치입니다.

## 인덱스 전략

현재 피드 조회 패턴에 필요한 주요 인덱스는 아래와 같습니다.

### `feed.feed_posts`

- `(created_at desc, id desc)`

이유:

- 홈 피드 최신순 정렬과 정확히 일치
- cursor continuation 조건 `(created_at, id)`와 맞물림

### `feed.feed_post_images`

- `(post_id, sort_order)`

이유:

- 페이지 조립 시 `post_id`로 묶어서 조회
- 이미지 순서를 바로 안정적으로 반환 가능

### `feed.feed_post_paws`

- 기존 unique `(post_id, user_id)`
- 추가 `(user_id, post_id)`

이유:

- exact existence check와 viewer별 `post_id in (...)` 조회는 접근 패턴이 다름
- viewer 기준 조회는 `user_id` 선두 복합 인덱스가 유리

### `feed.feed_post_hashtags`

- `(post_id)`

이유:

- 현재 페이지의 post slice에 연결된 태그를 빠르게 조회하기 위함

## 현재 한계

현재 쿼리 전략은 시간순 피드에는 강하지만, 아래는 아직 후속 과제입니다.

- 추천/랭킹 신호가 cursor 계약에 포함되지 않음
- 광고는 서버 주도 구조가 아님
- 추천 결과를 backend result에 직접 혼합하지 않음
- 이미지 전송 최적화는 업로드 자산 품질에 영향받음

하지만 현재 단계에서는 아래 경계를 유지하는 것이 가장 중요합니다.

- 먼저 시간순 slice를 정확히 조회
- 그 다음 페이지 단위로 배치 조립

이 경계를 유지하면 이후 추천, 광고, 랭킹이 붙더라도 구조를 비교적 안전하게 확장할 수 있습니다.
