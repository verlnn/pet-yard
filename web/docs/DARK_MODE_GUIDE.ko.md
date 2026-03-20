# PetYard 다크모드 가이드

이 문서는 PetYard 웹의 다크모드 초안 방향을 정리한 문서입니다.
향후 실제 구현 시 참고하는 기준 문서이며, 기존 화이트모드 디자인 언어와 함께 사용합니다.

## 1. 기본 방향

- 다크모드는 차분하고, 밀도감 있고, 읽기 쉬운 느낌이어야 한다.
- 순수한 검정을 기본 surface로 쓰지 않는다.
- 현재 사이드바 `더보기` 메뉴의 배경색을 다크모드의 핵심 surface 기준으로 삼는다.
- 다크모드라고 해서 다른 제품처럼 보이지 않게 하고, PetYard의 연장선처럼 느껴지게 한다.

## 2. 기준 색상

기본 다크 surface 기준:

- `slate-800`
- 대략적인 hex: `#1e293b`

권장 사용:

- 메인 다크 카드
- 사이드바 패널
- 드롭다운
- 오버레이 카드

보조 다크 값 권장:

- 앱 배경: `#0f172a` 또는 `#111827`
- 보조 surface: `#334155`
- border: `rgba(255, 255, 255, 0.12)`
- 기본 텍스트: `#f8fafc`
- 보조 텍스트: `#cbd5e1`
- muted 텍스트: `#94a3b8`

## 3. 화이트 / 다크모드 전략

앱은 최종적으로 화이트모드와 다크모드를 모두 지원할 예정이므로,
페이지마다 색을 직접 박아 넣는 방식은 피해야 한다.

대신 두 모드가 같은 semantic token 구조를 공유하도록 만든다.

원칙:

- 화이트모드는 역할을 정의한다.
- 다크모드는 같은 역할에 다른 값을 매핑한다.

예시:

- `background`: 앱 전체 배경
- `surface`: 카드/패널 표면
- `text-primary`: 가장 중요한 읽기 텍스트

## 4. CSS 변수 구조 초안

권장 루트 구조:

```css
:root {
  --color-bg: #ffffff;
  --color-bg-muted: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-border: rgba(15, 23, 42, 0.12);

  --color-text: #111827;
  --color-text-muted: #475569;
  --color-text-subtle: #94a3b8;

  --color-primary: #111827;
  --color-primary-contrast: #f8fafc;
  --color-accent: #c4553d;
  --color-danger: #ef4444;

  --shadow-soft: 0 20px 50px -35px rgba(15, 23, 42, 0.2);
  --shadow-card: 0 24px 56px -42px rgba(15, 23, 42, 0.12);
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-muted: #111827;
  --color-surface: #1e293b;
  --color-surface-muted: #334155;
  --color-surface-elevated: #273449;
  --color-border: rgba(255, 255, 255, 0.12);

  --color-text: #f8fafc;
  --color-text-muted: #cbd5e1;
  --color-text-subtle: #94a3b8;

  --color-primary: #f8fafc;
  --color-primary-contrast: #111827;
  --color-accent: #f2b38f;
  --color-danger: #f87171;

  --shadow-soft: 0 20px 50px -35px rgba(2, 6, 23, 0.55);
  --shadow-card: 0 24px 56px -42px rgba(2, 6, 23, 0.5);
}
```

## 5. 토큰 사용 규칙

직접 색상값보다 semantic variable 사용을 우선한다.

- 페이지 배경: `var(--color-bg)`
- 카드 배경: `var(--color-surface)`
- 보조 패널 배경: `var(--color-surface-muted)`
- 기본 텍스트: `var(--color-text)`
- 보조 텍스트: `var(--color-text-muted)`
- border: `var(--color-border)`

피해야 할 것:

- `bg-slate-800`, `text-white`, `border-white/10`를 여러 곳에 직접 반복하는 방식
- 공통 토큰 확인 없이 페이지마다 다른 다크 색을 임의로 정하는 방식

## 6. 컴포넌트 매핑 초안

우선 적용 권장:

- 앱 배경: `--color-bg`
- 사이드바 배경: `--color-surface`
- 드롭다운 / 더보기 메뉴: `--color-surface`
- 카드 surface: `--color-surface`
- hover surface: `--color-surface-muted`
- 모달 surface: `--color-surface-elevated`
- 기본 텍스트: `--color-text`
- 보조 텍스트: `--color-text-muted`

## 7. 다크모드에서의 모션과 효과

- glow 사용은 줄인다.
- 색 블러보다 대비와 레이어 구조로 깊이를 만든다.
- 그림자는 더 넓게가 아니라 조금 더 진하게 간다.
- 다크 패널은 blur-heavy glassmorphism보다 solid surface를 우선한다.

## 8. 구현 순서 제안

권장 순서:

1. 화이트/다크 공용 CSS 변수 도입
2. 레이아웃 배경과 주요 카드 surface 전환
3. 사이드바, 드롭다운, 모달, 피드 shell 전환
4. auth/onboarding 폼 전환
5. 예외 화면과 인터랙션 상태 정리

## 9. 중요한 제약

다크모드는 새로운 정체성이 되면 안 된다.
어두운 환경의 PetYard처럼 보여야지, 다른 제품처럼 보이면 안 된다.
