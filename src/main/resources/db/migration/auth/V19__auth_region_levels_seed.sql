insert into auth.region_levels (code, name)
values
  ('CITY', '시도'),
  ('DISTRICT', '시군구'),
  ('DONG', '읍면동'),
  ('RI', '리')
on conflict (code) do nothing;
