# 홈 피드 광고 계약

## 현재 상태
- 홈 피드 API는 아직 게시물만 내려준다.
- 인라인 광고는 게시물 목록이 조립된 뒤 프론트에서 주입한다.
- 광고는 누적 기준 게시물 4개마다 1개씩 들어간다.
- 광고 노출/클릭 tracking은 내부 adapter 인터페이스까지만 정리되어 있고, 외부 광고 서버로 전송하지는 않는다.

## 이번 변경 내용
- `HomeFeedAd`를 확장 가능한 계약으로 정리했다.
  - `adId`
  - `campaignId`
  - `slotKey`
  - `title`
  - `description`
  - `imageUrl`
  - `targetUrl`
  - `ctaLabel`
  - `tracking`
- fallback 광고 배열도 같은 계약을 따르도록 맞췄다.
- 인라인 광고 카드는 다음 이벤트를 분리해서 다룬다.
  - impression: 카드가 뷰포트에 들어왔을 때 1회
  - click: CTA 또는 이미지 링크 클릭 시
- tracking은 `HomeFeedAdTracker` 경계 뒤로 숨겨 두었다. 그래서 나중에 analytics나 광고 백엔드로 연결하더라도 카드 렌더링 코드를 크게 바꾸지 않아도 된다.

## 현재 프론트 주입 계약
- 순수 게시물 데이터와 UI용 혼합 리스트는 계속 분리한다.
- `buildHomeFeedItems(posts, ads, interval)`는 순수 함수로 유지한다.
- 삽입 규칙은 누적 기준이다.
  - 4번째, 8번째, 12번째 게시물 뒤에 광고 삽입
  - 현재 누적 목록의 마지막 게시물 뒤에는 광고를 붙이지 않음
- 이 방식이면 페이지가 추가되어도 광고 위치가 흔들리지 않는다.

## tracking 계약
- 현재 impression / click 이벤트에는 아래 필드가 포함된다.
  - `adId`
  - `campaignId`
  - `slotKey`
  - `targetUrl`
  - `position`
  - `source`
  - `placement`
  - `experimentKey`
- 기본 구현은 기존 홈 피드 debug logger를 통해 기록만 남긴다.
- 실제 운영 analytics 연동은 이번 작업 범위에 넣지 않았다.

## 서버 주도 sponsored item으로 확장하는 방법
- 나중에 백엔드가 sponsored item을 직접 내려주더라도, 렌더링 계층은 하나의 혼합 item 계약만 소비하도록 유지하는 편이 좋다.
- 권장 전환 순서는 다음과 같다.
  1. 백엔드가 `post`와 `sponsored`를 함께 내려줌
  2. 프론트 매핑 계층이 이를 현재 `HomeFeedListItem` union으로 변환
  3. `HomeFeedAdTracker`는 그대로 재사용
- 이렇게 하면 광고 배치 권한은 서버로 넘기면서도, UI와 tracking 코드는 안정적으로 유지할 수 있다.

## 프론트 주입 방식 vs 서버 주입 방식

### 프론트 주입 방식
- 장점
  - 도입이 단순하다
  - 백엔드 광고 의존성이 없다
  - fallback 처리하기 쉽다
- 단점
  - pacing, targeting을 중앙에서 제어하기 어렵다
  - deduplication 보장이 약하다
  - 사용자/세션 단위 frequency cap 제어가 제한적이다

### 서버 주입 방식
- 장점
  - 광고 위치와 pacing을 일관되게 제어할 수 있다
  - 타게팅 적용이 쉬워진다
  - 캠페인 단위 deduplication, 리포팅이 유리하다
- 단점
  - 백엔드 복잡도가 올라간다
  - 계약 관리가 더 엄격해진다
  - 광고 서빙 지연이 피드 응답 경로에 들어온다

## 추후 포함해야 할 개념
- frequency cap
- audience targeting
- campaign pacing
- 세션/탭 간 deduplication
- experiment bucketing

## 남아 있는 한계
- 아직 인라인 광고는 정적 fallback 크리에이티브만 사용한다.
- impression은 viewport 진입 기준만 다루고 체류 시간은 고려하지 않는다.
- click 이벤트도 아직 로컬 logging 수준이고 실제 analytics 인프라로 보내지 않는다.

## 추후 개선 포인트
- `HomeFeedAdTracker`를 내부 analytics 파이프라인에 연결
- 백엔드 sponsored item 응답을 붙이되 카드 조합 구조는 유지
- 실제 광고 운영이 시작되면 pacing과 deduplication 규칙 추가
