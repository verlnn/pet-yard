alter table if exists auth.user_profile_settings
    add column if not exists primary_pet_id bigint references pet.pet_profiles(id);

comment on column auth.user_profile_settings.primary_pet_id is '대표 반려동물 식별자';
