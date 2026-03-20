# Migration Convention

현재 프로젝트는 초기화 가능한 전제로, 마이그레이션을 스키마별/테이블별 구조로 재정렬했다.

규칙:
- 스키마별 디렉토리를 사용한다.
- 가능한 한 테이블/주제 단위로 파일을 분리한다.
- 파일 위치 예시:
  - `db/migration/auth/V10__auth_some_table.sql`
  - `db/migration/pet/V20__pet_some_table.sql`
  - `db/migration/feed/V30__feed_some_table.sql`
  - `db/migration/core/V40__core_some_object.sql`

권장:
- 하나의 파일에는 하나의 테이블 생성 또는 하나의 변경 주제를 담는다.
- 부득이하게 강하게 결합된 테이블/seed는 같은 파일에 둘 수 있다.
