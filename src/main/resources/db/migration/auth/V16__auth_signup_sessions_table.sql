create table if not exists auth.signup_sessions (
  id bigserial primary key,
  provider varchar(20) not null,
  state varchar(128) not null,
  session_token varchar(128),
  user_id bigint references auth.users(id),
  step varchar(30) not null,
  status varchar(30) not null,
  metadata jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uk_signup_state on auth.signup_sessions (state);
create unique index if not exists uk_signup_token on auth.signup_sessions (session_token) where session_token is not null;
create index if not exists idx_signup_user on auth.signup_sessions (user_id);

create or replace trigger trg_signup_sessions_updated_at
before update on auth.signup_sessions
for each row execute function auth.touch_updated_at();

comment on table auth.signup_sessions is '회원가입 진행 세션 정보';
comment on column auth.signup_sessions.id is '회원가입 세션 식별자';
comment on column auth.signup_sessions.provider is '가입 제공자';
comment on column auth.signup_sessions.state is 'OAuth state 값';
comment on column auth.signup_sessions.session_token is '회원가입 세션 토큰';
comment on column auth.signup_sessions.user_id is '연결된 회원 식별자';
comment on column auth.signup_sessions.step is '현재 진행 단계';
comment on column auth.signup_sessions.status is '세션 상태';
comment on column auth.signup_sessions.metadata is '추가 메타데이터';
comment on column auth.signup_sessions.expires_at is '세션 만료 시각';
comment on column auth.signup_sessions.created_at is '생성 시각';
comment on column auth.signup_sessions.updated_at is '수정 시각';
