alter table if exists auth.auth_identities
    drop constraint if exists chk_auth_identities_provider;

alter table if exists auth.auth_identities
    add constraint chk_auth_identities_provider
        check (provider in ('EMAIL', 'KAKAO'));

alter table if exists auth.signup_sessions
    drop constraint if exists chk_signup_sessions_provider;

alter table if exists auth.signup_sessions
    add constraint chk_signup_sessions_provider
        check (provider in ('EMAIL', 'KAKAO'));

alter table if exists auth.signup_sessions
    drop constraint if exists chk_signup_sessions_step;

alter table if exists auth.signup_sessions
    add constraint chk_signup_sessions_step
        check (step in ('OAUTH', 'PROFILE', 'CONSENTS', 'PET', 'COMPLETE'));

alter table if exists auth.signup_sessions
    drop constraint if exists chk_signup_sessions_status;

alter table if exists auth.signup_sessions
    add constraint chk_signup_sessions_status
        check (status in ('OAUTH_PENDING', 'ONBOARDING', 'COMPLETED', 'CANCELLED'));

alter table if exists pet.pet_profiles
    drop constraint if exists chk_pet_profiles_species;

alter table if exists pet.pet_profiles
    add constraint chk_pet_profiles_species
        check (species in ('DOG', 'CAT', 'OTHER'));

alter table if exists pet.pet_profiles
    drop constraint if exists chk_pet_profiles_gender;

alter table if exists pet.pet_profiles
    add constraint chk_pet_profiles_gender
        check (gender in ('MALE', 'FEMALE', 'UNKNOWN'));
