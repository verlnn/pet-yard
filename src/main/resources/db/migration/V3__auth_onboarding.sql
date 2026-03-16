-- Auth Onboarding & Social Identities
alter table if exists auth.users
  alter column email drop not null,
  alter column password_hash drop not null;

create table if not exists auth.auth_identities (
  id                 bigserial primary key,
  user_id            bigint not null references auth.users(id),
  provider           varchar(20) not null,
  provider_user_id   varchar(128) not null,
  email              varchar(320),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists uk_auth_id_provider_user
  on auth.auth_identities (provider, provider_user_id);

create unique index if not exists uk_auth_id_email
  on auth.auth_identities (email) where email is not null;

create table if not exists auth.user_profiles (
  id               bigserial primary key,
  user_id          bigint not null references auth.users(id),
  nickname         varchar(40) not null,
  region_code      varchar(20),
  profile_image_url varchar(512),
  marketing_opt_in boolean not null default false,
  has_pet          boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index if not exists uk_user_profiles_user
  on auth.user_profiles (user_id);
create unique index if not exists uk_user_profiles_nickname
  on auth.user_profiles (nickname);

create table if not exists auth.terms (
  id          bigserial primary key,
  code        varchar(40) not null,
  version     integer not null,
  title       varchar(200) not null,
  mandatory   boolean not null default true,
  content_url varchar(512),
  created_at  timestamptz not null default now()
);
create unique index if not exists uk_terms_code_version
  on auth.terms (code, version);

create table if not exists auth.terms_agreements (
  id         bigserial primary key,
  user_id    bigint not null references auth.users(id),
  terms_id   bigint not null references auth.terms(id),
  agreed_at  timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists uk_terms_agreements
  on auth.terms_agreements (user_id, terms_id);

create table if not exists auth.signup_sessions (
  id            bigserial primary key,
  provider      varchar(20) not null,
  state         varchar(128) not null,
  session_token varchar(128),
  user_id       bigint references auth.users(id),
  step          varchar(30) not null,
  status        varchar(30) not null,
  metadata      jsonb,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists uk_signup_state
  on auth.signup_sessions (state);
create unique index if not exists uk_signup_token
  on auth.signup_sessions (session_token) where session_token is not null;
create index if not exists idx_signup_user
  on auth.signup_sessions (user_id);

create table if not exists auth.regions (
  code        varchar(20) primary key,
  name        varchar(100) not null,
  parent_code varchar(20),
  level       varchar(20) not null
);
create index if not exists idx_regions_parent on auth.regions (parent_code);

create table if not exists pet.pet_profiles (
  id            bigserial primary key,
  user_id       bigint not null references auth.users(id),
  name          varchar(40) not null,
  species       varchar(20) not null,
  breed         varchar(60),
  birth_date    date,
  age_group     varchar(20),
  gender        varchar(10) not null,
  neutered      boolean,
  intro         varchar(500),
  photo_url     varchar(512),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_pet_profiles_user on pet.pet_profiles (user_id);

create or replace trigger trg_user_profiles_updated_at
before update on auth.user_profiles
for each row execute function auth.touch_updated_at();

create or replace trigger trg_auth_identities_updated_at
before update on auth.auth_identities
for each row execute function auth.touch_updated_at();

create or replace trigger trg_signup_sessions_updated_at
before update on auth.signup_sessions
for each row execute function auth.touch_updated_at();

insert into auth.terms (code, version, title, mandatory, content_url)
values
  ('SERVICE', 1, '서비스 이용약관', true, null),
  ('PRIVACY', 1, '개인정보 처리방침', true, null),
  ('MARKETING', 1, '마케팅 수신 동의', false, null)
on conflict (code, version) do nothing;
