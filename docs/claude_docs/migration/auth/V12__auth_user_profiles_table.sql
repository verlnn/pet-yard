create table if not exists auth.user_profiles (
  id bigserial primary key,
  user_id bigint not null references auth.users(id),
  nickname varchar(40) not null,
  region_code varchar(20),
  profile_image_url varchar(512),
  marketing_opt_in boolean not null default false,
  has_pet boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uk_user_profiles_user on auth.user_profiles (user_id);
create unique index if not exists uk_user_profiles_nickname on auth.user_profiles (nickname);

create or replace trigger trg_user_profiles_updated_at
before update on auth.user_profiles
for each row execute function auth.touch_updated_at();

comment on table auth.user_profiles is '회원 프로필 부가 정보';
comment on column auth.user_profiles.id is '회원 프로필 식별자';
comment on column auth.user_profiles.user_id is '회원 식별자';
comment on column auth.user_profiles.nickname is '닉네임';
comment on column auth.user_profiles.region_code is '선택한 지역 코드';
comment on column auth.user_profiles.profile_image_url is '프로필 이미지 URL';
comment on column auth.user_profiles.marketing_opt_in is '마케팅 수신 동의 여부';
comment on column auth.user_profiles.has_pet is '반려동물 보유 여부';
comment on column auth.user_profiles.created_at is '생성 시각';
comment on column auth.user_profiles.updated_at is '수정 시각';
