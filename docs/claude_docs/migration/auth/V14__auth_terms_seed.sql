insert into auth.terms (code, version, title, mandatory, content_url)
values
  ('SERVICE', 1, '서비스 이용약관', true, null),
  ('PRIVACY', 1, '개인정보 처리방침', true, null),
  ('MARKETING', 1, '마케팅 수신 동의', false, null)
on conflict (code, version) do nothing;
