create table if not exists auth.auth_identities (
  id bigserial primary key,
  user_id bigint not null references auth.users(id),
  provider varchar(20) not null,
  provider_user_id varchar(128) not null,
  email varchar(320),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uk_auth_id_provider_user
  on auth.auth_identities (provider, provider_user_id);

create unique index if not exists uk_auth_id_email
  on auth.auth_identities (email) where email is not null;

create or replace trigger trg_auth_identities_updated_at
before update on auth.auth_identities
for each row execute function auth.touch_updated_at();

comment on table auth.auth_identities is '소셜 로그인 연동 계정 정보';
comment on column auth.auth_identities.id is '연동 계정 식별자';
comment on column auth.auth_identities.user_id is '회원 식별자';
comment on column auth.auth_identities.provider is '소셜 로그인 제공자';
comment on column auth.auth_identities.provider_user_id is '제공자별 사용자 식별값';
comment on column auth.auth_identities.email is '연동 계정 이메일';
comment on column auth.auth_identities.created_at is '생성 시각';
comment on column auth.auth_identities.updated_at is '수정 시각';
