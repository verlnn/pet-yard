create table if not exists auth.region_levels (
  code        varchar(20) primary key,
  name        varchar(50) not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace trigger trg_region_levels_updated_at
before update on auth.region_levels
for each row execute function auth.touch_updated_at();

insert into auth.region_levels (code, name)
values
  ('CITY', '시도'),
  ('DISTRICT', '시군구'),
  ('DONG', '읍면동'),
  ('RI', '리')
on conflict (code) do nothing;
