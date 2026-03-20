create table if not exists auth.region_levels (
  code varchar(20) primary key,
  name varchar(50) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger trg_region_levels_updated_at
before update on auth.region_levels
for each row execute function auth.touch_updated_at();

comment on table auth.region_levels is '행정구역 레벨 코드 정보';
comment on column auth.region_levels.code is '행정구역 레벨 코드';
comment on column auth.region_levels.name is '행정구역 레벨명';
comment on column auth.region_levels.created_at is '생성 시각';
comment on column auth.region_levels.updated_at is '수정 시각';
