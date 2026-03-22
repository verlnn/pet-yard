insert into auth.tiers (tier_cd, tier_nm, description)
values
  ('TIER_0', '기본 인증 사용자', '이메일 인증 완료 사용자'),
  ('TIER_1', '반려동물 인증 사용자', '반려동물 인증 완료 사용자'),
  ('TIER_2', '신뢰 사용자', '신뢰 기준 충족 사용자')
on conflict (tier_cd)
do update set
  tier_nm = excluded.tier_nm,
  description = excluded.description,
  is_active = true,
  updated_at = now();
