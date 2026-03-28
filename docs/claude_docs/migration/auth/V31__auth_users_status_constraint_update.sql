alter table if exists auth.users
    drop constraint if exists chk_users_status;

alter table if exists auth.users
    add constraint chk_users_status
        check (status in (
            'PENDING_ONBOARDING',
            'PENDING_VERIFICATION',
            'ACTIVE',
            'DORMANT',
            'SUSPENDED',
            'DELETED',
            'WITHDRAWN'
        ));
