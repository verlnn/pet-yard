create table if not exists auth.user_profile_settings (
  id bigserial primary key,
  user_id bigint not null references auth.users(id),
  bio varchar(150),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uk_user_profile_settings_user on auth.user_profile_settings (user_id);

create or replace trigger trg_user_profile_settings_updated_at
before update on auth.user_profile_settings
for each row execute function auth.touch_updated_at();

comment on table auth.user_profile_settings is '회원 프로필 편집 설정';
comment on column auth.user_profile_settings.id is '회원 프로필 설정 식별자';
comment on column auth.user_profile_settings.user_id is '회원 식별자';
comment on column auth.user_profile_settings.bio is '프로필 소개글';
comment on column auth.user_profile_settings.created_at is '생성 시각';
comment on column auth.user_profile_settings.updated_at is '수정 시각';
