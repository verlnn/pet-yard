alter table if exists auth.users
    add column if not exists username varchar(30);

alter table if exists auth.users
    drop constraint if exists chk_users_username;

alter table if exists auth.users
    add constraint chk_users_username
        check (
            username is null
            or username ~ '^(?!\\.)(?!.*\\.\\.)(?!.*\\.$)[a-z0-9._]{1,30}$'
        );

create unique index if not exists uk_users_username on auth.users (username) where username is not null;

comment on column auth.users.username is '사용자에게 노출되는 공개 식별자';
