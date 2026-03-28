update auth.users
set username = concat('user.', id::text)
where username is null;

alter table if exists auth.users
    alter column username set not null;
