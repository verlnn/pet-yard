alter table if exists auth.user_profile_settings
    add column if not exists gender varchar(20);

alter table if exists auth.user_profile_settings
    drop constraint if exists chk_user_profile_settings_gender;

alter table if exists auth.user_profile_settings
    add constraint chk_user_profile_settings_gender
        check (gender is null or gender in ('PRIVATE', 'FEMALE', 'MALE', 'UNSPECIFIED'));

comment on column auth.user_profile_settings.gender is '프로필 편집용 성별 설정';
