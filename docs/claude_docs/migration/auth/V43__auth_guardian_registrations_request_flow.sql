alter table auth.guardian_registrations
    add column if not exists status varchar(20);

alter table auth.guardian_registrations
    add column if not exists responded_at timestamptz;

update auth.guardian_registrations
set status = 'ACCEPTED',
    responded_at = coalesce(responded_at, created_at)
where status is null;

alter table auth.guardian_registrations
    alter column status set not null,
    alter column status set default 'REQUESTED';

alter table auth.guardian_registrations
    drop constraint if exists chk_auth_guardian_registrations_status;

alter table auth.guardian_registrations
    add constraint chk_auth_guardian_registrations_status
        check (status in ('REQUESTED', 'ACCEPTED'));

comment on column auth.guardian_registrations.status is '집사 관계 상태';
comment on column auth.guardian_registrations.responded_at is '요청 수락 시각';
