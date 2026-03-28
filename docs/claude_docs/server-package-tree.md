# Server Package Tree

기준 경로: `src/main/java/io/pet/petyard`

```text
io/pet/petyard
├── auth
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       ├── mail
│   │       ├── oauth
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   ├── in
│   │   │   └── out
│   │   └── service
│   ├── config
│   ├── context
│   ├── demo
│   ├── domain
│   │   └── model
│   ├── error
│   ├── filter
│   ├── guard
│   ├── jwt
│   ├── oauth
│   └── security
├── common
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   └── service
│   ├── config
│   ├── domain
│   │   └── model
│   └── storage
├── feed
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── model
│   │   ├── port
│   │   │   └── out
│   │   └── service
│   └── domain
│       └── model
├── notification
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   └── out
│   │   └── service
│   └── domain
│       └── model
├── onboarding
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   ├── in
│   │   │   └── out
│   │   └── service
│   └── domain
│       └── model
├── pet
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   └── out
│   │   └── service
│   └── domain
│       └── model
├── region
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   └── out
│   └── domain
│       └── model
├── terms
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   └── out
│   └── domain
│       └── model
├── user
│   ├── adapter
│   │   ├── in
│   │   │   └── web
│   │   └── out
│   │       └── persistence
│   ├── application
│   │   ├── port
│   │   │   └── out
│   │   └── service
│   └── domain
│       └── model
└── web
```

참고:

- `auth`, `feed`, `notification`, `onboarding`, `pet`, `region`, `terms`, `user`가 도메인별 최상위 패키지로 분리되어 있습니다.
- 다수 패키지는 `adapter / application / domain` 구조를 따르며, 헥사고날 아키텍처 형태를 유지하고 있습니다.
- 공통 기술 요소는 `common`, 웹 진입 관련 보조 구성은 `web`에 위치합니다.
