alter table auth.user_notifications
    drop constraint if exists chk_auth_user_notifications_type;

alter table auth.user_notifications
    add constraint chk_auth_user_notifications_type
        check (type in (
            'GUARDIAN_REQUEST',
            'GUARDIAN_REQUEST_ACCEPTED',
            'COMMENT_ON_POST',
            'COMMENT_REPLY',
            'PAW_ON_POST',
            'PAW_ON_COMMENT'
        ));
