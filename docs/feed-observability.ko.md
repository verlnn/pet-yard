# 피드 관측성

## 현재 상태

홈 피드는 이번 작업으로 백엔드/프론트 양쪽에 최소 수준의 관측 장치를 갖추게 되었습니다. 무거운 메트릭 인프라를 추가하지 않고도, 느린 지점을 파악할 수 있는 수준을 목표로 했습니다.

이번에 집중한 내용:

- 백엔드 structured timing log
- 프론트 debug 전용 timing / fetch 진단
- 운영 시 확인해야 할 핵심 지표 정리

## 이번 변경 내용

### 백엔드 timing log

`FeedApplicationService.listHomeFeed(...)`는 이제 홈 피드 요청마다 structured timing log를 남깁니다.

현재 로그 필드:

- `userId`
- `pageSize`
- `hasCursor`
- `itemCount`
- `hasMore`
- `postQueryMs`
- `relatedQueryMs`
- `assemblyMs`
- `totalMs`

측정 구간:

1. 게시물 slice 조회
2. 연관 데이터 배치 조회
3. DTO 조립

아직 메트릭 시스템까지 붙이지는 않았지만, 로컬 디버깅이나 초기 운영 이슈 대응에는 충분히 유용한 수준입니다.

### 프론트 debug 계측

프론트는 `feed:debug=true` 로컬 스토리지 플래그 또는 `NEXT_PUBLIC_FEED_DEBUG=true` 환경변수 하에서만 debug 로그를 남깁니다.

현재 디버그 이벤트:

- 첫 페이지 렌더 완료
- 다음 페이지 요청 시작
- observer guard로 막힌 다음 페이지 fetch 시도
- 재진입 시 scroll restore 실행

즉, 운영 콘솔을 오염시키지 않으면서도 개발 환경에서는 흐름을 추적할 수 있습니다.

## 운영 시 볼 지표

### 백엔드

- `/api/feeds` latency p50 / p95 / p99
- page당 SQL 수
- 게시물 slice query 시간
- 배치 연관 조회 시간
- DTO assembly 시간

### 프론트

- 첫 페이지 요청부터 렌더 완료까지의 시간
- 세션당 추가 페이지 fetch 횟수
- observer guard로 막힌 fetch 시도 수
- 이미지 로드 실패 수
- 재진입 시 scroll restore 성공률

### 광고 관련

- impression 수
- click 수
- click-through rate

광고는 아직 클라이언트 fallback 구조이므로, 실제 analytics backend 전송은 다음 단계 과제입니다.

## 구현된 것과 미구현 항목

현재 구현됨:

- 백엔드 timing log
- 프론트 debug 계측

추후 인프라 연동 필요:

- 중앙 메트릭 집계
- 대시보드 기반 p95/p99 추적
- distributed tracing
- request correlation id
- 이미지 실패율 수집
- 광고 분석 파이프라인

## 남아 있는 한계

- 백엔드 timing은 아직 메트릭 export가 아니라 로그 기반
- 프론트 timing은 debug 전용이며 영속 수집 안 함
- 브라우저 요청과 백엔드 조립을 관통하는 end-to-end trace는 없음

## 다음 개선 포인트

권장 후속 작업:

1. backend timing을 실제 metrics backend로 export
2. controller ~ service 간 request correlation id 도입
3. 클라이언트 이미지 로드 실패를 lightweight event buffer로 수집
4. 광고 impression / click을 실제 analytics sink에 연결
