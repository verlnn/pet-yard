create table auth.guardian_registrations (
    id bigserial primary key,
    guardian_user_id bigint not null references auth.users(id) on delete cascade,
    target_user_id bigint not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    constraint uq_auth_guardian_registrations unique (guardian_user_id, target_user_id),
    constraint chk_auth_guardian_registrations_not_self check (guardian_user_id <> target_user_id)
);

create index idx_auth_guardian_registrations_guardian_target
    on auth.guardian_registrations (guardian_user_id, target_user_id);

comment on table auth.guardian_registrations is '회원 간 집사 등록 관계';
comment on column auth.guardian_registrations.id is '집사 등록 식별자';
comment on column auth.guardian_registrations.guardian_user_id is '집사 등록을 수행한 회원 식별자';
comment on column auth.guardian_registrations.target_user_id is '집사 등록 대상 회원 식별자';
comment on column auth.guardian_registrations.created_at is '생성 시각';
