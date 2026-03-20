create table if not exists auth.tiers (
  tier_cd varchar(20) primary key,
  tier_nm varchar(50) not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tiers_is_active on auth.tiers (is_active);

create trigger trg_tiers_updated_at
before update on auth.tiers
for each row
execute function auth.touch_updated_at();

comment on table auth.tiers is '서비스 회원 등급 메타 정보';
comment on column auth.tiers.tier_cd is '회원 등급 코드';
comment on column auth.tiers.tier_nm is '회원 등급명';
comment on column auth.tiers.description is '회원 등급 설명';
comment on column auth.tiers.is_active is '회원 등급 활성 여부';
comment on column auth.tiers.created_at is '생성 시각';
comment on column auth.tiers.updated_at is '수정 시각';
