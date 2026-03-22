insert into auth.user_profile_settings (user_id, primary_pet_id)
select single_pet.user_id, single_pet.pet_id
from (
    select user_id, min(id) as pet_id
    from pet.pet_profiles
    group by user_id
    having count(*) = 1
) single_pet
left join auth.user_profile_settings settings on settings.user_id = single_pet.user_id
where settings.user_id is null;

update auth.user_profile_settings settings
set primary_pet_id = single_pet.pet_id
from (
    select user_id, min(id) as pet_id
    from pet.pet_profiles
    group by user_id
    having count(*) = 1
) single_pet
where settings.user_id = single_pet.user_id
  and settings.primary_pet_id is null;
