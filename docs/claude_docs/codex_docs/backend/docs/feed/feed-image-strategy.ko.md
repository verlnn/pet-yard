# 피드 이미지 전략

## 현재 상태

홈 피드는 현재 카드당 사실상 하나의 실제 이미지 자산을 사용하고 있고, 아직 파생 이미지 생성 파이프라인은 없습니다.

현재 상황:

- 업로드된 피드 이미지는 로컬 스토리지에 1회 저장됨
- 피드 API는 같은 URL을 thumbnail, medium, original로 매핑할 수 있음
- width, height는 아직 저장하지 않음
- 카드 레이아웃 안정화는 aspect-ratio 메타에 의존함

즉, 실제 물리 파일은 하나지만, 응답 모델에서는 이미지 역할을 분리해 두어 이후 계약 확장을 쉽게 한 상태입니다.

## 이번 변경 내용

### 응답 구조

기존 호환 필드는 그대로 유지합니다.

- `thumbnailImageUrl`
- `imageUrls`
- `imageAspectRatioValue`
- `imageAspectRatio`

추가된 구조화된 이미지 메타:

- `images[].thumbnailUrl`
- `images[].mediumUrl`
- `images[].originalUrl`
- `images[].width`
- `images[].height`
- `images[].aspectRatio`
- `images[].aspectRatioCode`

현재 매핑 정책:

- 실제 저장 자산이 하나뿐이면 세 URL은 같은 파일을 가리킴
- width/height는 현재 `null`
- aspect ratio는 기존 피드 이미지 메타에서 매핑

이렇게 하면 지금 API를 깨지 않으면서도, 나중에 썸네일/중간 이미지가 생겼을 때 계약을 다시 갈아엎지 않아도 됩니다.

### 프론트 사용 정책

홈 피드 카드는 전용 helper를 통해 이미지를 고릅니다.

- 우선 `images[].thumbnailUrl`
- 없으면 `images[].mediumUrl`
- 그다음 `images[].originalUrl`
- 마지막으로 legacy `thumbnailImageUrl` / `imageUrls`

즉, 코드상으로는 이미 “목록용 이미지”와 “원본 이미지”가 다른 역할이라는 점을 명확히 해 둔 상태입니다.

### 렌더링 정책

현재 로딩 정책:

- 첫 화면 일부 카드만 eager loading 허용
- 나머지는 lazy loading
- `decoding="async"` 사용
- 중요한 이미지에는 `fetchPriority="high"`
- 일반 이미지는 `fetchPriority="auto"`

### 레이아웃 시프트 방지

기존에도 aspect-ratio는 있었지만, 이번에는 이미지 선택 경로의 일부로 명확히 정리했습니다.

- 구조화된 이미지 메타의 aspect ratio 우선
- 없으면 legacy aspect ratio value 사용
- 그것도 없으면 aspect ratio code fallback

그래서 이미지 로드 전후 카드 높이 흔들림을 줄일 수 있습니다.

## 남아 있는 한계

아직 아래는 구현되지 않았습니다.

- 실제 썸네일 생성
- 중간 크기 이미지 생성
- width/height 영속화
- CDN 리사이징
- blur placeholder / progressive placeholder

즉, 원본 이미지가 무거운 경우 네트워크 비용은 여전히 클 수 있습니다.

## 권장 후속 전략

### 파생 이미지 생성

업로드 시점에 아래를 생성/저장하는 방식을 권장합니다.

- original
- medium
- thumbnail

권장 사용처:

- 홈 피드 카드: thumbnail 또는 medium
- 피드 상세: medium 기본, 확대/원본 보기 시 original
- 프로필 그리드: thumbnail

### 권장 사이즈

피드 이미지:

- thumbnail: 짧은 축 기준 `480px` 내외
- medium: 짧은 축 기준 `1080px` 내외
- original: 보관용 원본 또는 정규화된 고해상도

프로필 이미지:

- small avatar: `96px`
- standard avatar: `256px`

### CDN / 캐시 전략

권장 CDN 정책:

- 파생 이미지별 immutable cache key
- 긴 `Cache-Control`
- 재생성 시 URL versioning

### 최종 사용 원칙

실제 파생 이미지 파이프라인이 생기면 피드는 아래 우선순위를 따라야 합니다.

1. 목록 렌더링: `thumbnailUrl`
2. 큰 미리보기: `mediumUrl`
3. 상세/확대/원본: `originalUrl`

이번에 추가한 응답 구조는 바로 그 방향을 염두에 둔 계약입니다.
