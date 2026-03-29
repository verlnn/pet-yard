alter table auth.user_profiles
    add column if not exists is_private boolean not null default false;

comment on column auth.user_profiles.is_private is '비공개 계정 여부 (true이면 집사만 콘텐츠 열람 가능)';
