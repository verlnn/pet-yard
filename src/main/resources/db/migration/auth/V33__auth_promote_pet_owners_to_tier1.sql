update auth.users u
set tier = 'TIER_1',
    updated_at = now()
where u.tier = 'TIER_0'
  and exists (
    select 1
    from pet.pet_profiles p
    where p.user_id = u.id
  );
