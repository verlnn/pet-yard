create table if not exists auth.user_notifications (
    id bigserial primary key,
    recipient_user_id bigint not null references auth.users(id) on delete cascade,
    actor_user_id bigint not null references auth.users(id) on delete cascade,
    type varchar(40) not null,
    status varchar(20) not null default 'UNREAD',
    created_at timestamptz not null default now(),
    read_at timestamptz,
    acted_at timestamptz,
    constraint chk_auth_user_notifications_type
        check (type in ('GUARDIAN_REQUEST', 'GUARDIAN_REQUEST_ACCEPTED')),
    constraint chk_auth_user_notifications_status
        check (status in ('UNREAD', 'READ', 'ACCEPTED', 'REJECTED', 'CANCELED'))
);

create index if not exists idx_auth_user_notifications_recipient_created_at
    on auth.user_notifications (recipient_user_id, created_at desc, id desc);

create index if not exists idx_auth_user_notifications_request_lookup
    on auth.user_notifications (recipient_user_id, actor_user_id, type, status, created_at desc);

comment on table auth.user_notifications is '사용자 알림';
comment on column auth.user_notifications.recipient_user_id is '알림 수신 회원 식별자';
comment on column auth.user_notifications.actor_user_id is '알림을 발생시킨 회원 식별자';
comment on column auth.user_notifications.type is '알림 유형';
comment on column auth.user_notifications.status is '알림 상태';
comment on column auth.user_notifications.created_at is '생성 시각';
comment on column auth.user_notifications.read_at is '읽음 처리 시각';
comment on column auth.user_notifications.acted_at is '수락/거절/취소 처리 시각';
