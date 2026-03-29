create index if not exists idx_user_profiles_is_private
    on auth.user_profiles (user_id, is_private);

create index if not exists idx_guardian_registrations_lookup
    on auth.guardian_registrations (guardian_user_id, target_user_id, status);
