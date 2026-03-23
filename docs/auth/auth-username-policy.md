# Username Policy

## Current State

멍냥마당은 내부 회원 PK로 bigint `id`를 유지하고, 사용자에게 노출되는 공개 식별자는 별도의 `username` 컬럼으로 관리한다.

- 내부 식별자: `auth.users.id`
- 공개 식별자: `auth.users.username`
- 로그인 식별자: 이메일 유지

즉 `username`은 로그인 ID가 아니라 프로필 URL, 공개 조회, 검색, 멘션 확장을 위한 공개 키다.

## Policy

### Allowed characters

- `a-z`
- `0-9`
- `_`
- `.`

### Forbidden

- 한글
- 공백
- 대문자 원본 저장
- 기타 특수문자
- `.` 시작
- `..` 포함
- `.` 종료

### Length

- min: `1`
- max: `30`

### Canonical regex

```text
^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{1,30}$
```

## Normalization

애플리케이션은 입력값에 아래 정규화를 먼저 적용한다.

1. `trim`
2. `lowercase(Locale.ROOT)`

이후 정규식 검증을 통과해야 저장 가능하다.

예시:

- `PetYard.Owner` -> `petyard.owner`
- ` owner.test ` -> `owner.test`

정규화 이후에도 규칙에 맞지 않으면 저장하지 않는다.

## Validation Layers

### Domain

- `io.pet.petyard.auth.domain.Username`
- 규칙 상수화
- 정규화 + 검증 로직 단일화

### Application

- 회원가입
- 소셜 온보딩 프로필 저장
- 내 프로필 설정 변경

중복 검사와 사용자 메시지 매핑을 담당한다.

### Database

- `varchar(30)`
- check constraint
- unique index
- not null

애플리케이션 버그나 우회 입력이 있어도 DB가 마지막 방어선 역할을 한다.

## Migration Strategy

이번 변경은 2단계 마이그레이션으로 적용한다.

### Step 1

- `username` nullable 추가
- check constraint 추가
- partial unique index 추가

### Step 2

- 기존 회원 `user.<id>` 형식으로 백필
- `not null` 전환

이 방식은 기존 운영 데이터가 있는 상태에서 가장 안전한 절충안이다.

## API Impact

- `POST /api/auth/signup` 요청에 `username` 추가
- `GET /api/users/me/profile` 응답에 `username` 추가
- `PATCH /api/users/me/profile` 요청에 `username` 추가
- `GET /api/users/{username}/profile` 공개 조회 경로 추가

## Error Handling

- 형식 오류: `INVALID_USERNAME`
- 중복 오류: `USERNAME_ALREADY_TAKEN`

사용자 메시지 원칙:

- 형식 오류는 규칙이 잘못되었음을 바로 알려준다
- 중복 오류는 이미 사용 중인 공개 ID임을 알려준다

## This Change

- `auth.users.username` 컬럼/제약/백필 추가
- 도메인 `Username` 값 객체 추가
- 회원가입/온보딩/프로필 수정에 동일 정책 적용
- 공개 프로필 username 조회 API 추가

## Remaining Limits

- 현재는 username 변경 횟수 제한이 없다
- 과거 username 이력은 저장하지 않는다
- 예약어 목록(admin, support 등)은 아직 별도 차단하지 않는다

## TODO

- username 예약어 정책 도입 검토
- username 변경 이력 또는 cooldown 정책 검토
- 멘션/검색 기능에서 username 색인 전략 구체화
- 공개 프로필 라우팅을 프론트 URL 구조와 연결
