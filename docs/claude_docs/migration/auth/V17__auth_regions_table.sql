create table if not exists auth.regions (
  code varchar(20) primary key,
  name varchar(100) not null,
  parent_code varchar(20),
  level varchar(20) not null
);

create index if not exists idx_regions_parent on auth.regions (parent_code);

comment on table auth.regions is '행정구역 마스터 정보';
comment on column auth.regions.code is '행정구역 코드';
comment on column auth.regions.name is '행정구역명';
comment on column auth.regions.parent_code is '상위 행정구역 코드';
comment on column auth.regions.level is '행정구역 레벨';
